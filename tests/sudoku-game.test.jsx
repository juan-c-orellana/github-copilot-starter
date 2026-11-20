import { act, fireEvent, render, screen } from '@testing-library/react';
import SudokuPageError from '../app/error.jsx';
import SudokuGame from '../src/components/SudokuGame.jsx';
import { loadLeaderboard } from '../src/game/leaderboard.js';
import { createPuzzle } from '../src/game/sudoku.js';

jest.mock('../src/game/sudoku.js', () => {
    const actual = jest.requireActual('../src/game/sudoku.js');
    return {
        ...actual,
        createPuzzle: jest.fn(actual.createPuzzle),
    };
});

const getCells = () => screen.getAllByRole('textbox');

const solvedBoard = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 3, 4, 5, 6, 7, 8, 9, 1],
    [5, 6, 7, 8, 9, 1, 2, 3, 4],
    [8, 9, 1, 2, 3, 4, 5, 6, 7],
    [3, 4, 5, 6, 7, 8, 9, 1, 2],
    [6, 7, 8, 9, 1, 2, 3, 4, 5],
    [9, 1, 2, 3, 4, 5, 6, 7, 8],
];

const createGameFixture = (emptyCells = [[0, 0]]) => {
    const puzzle = solvedBoard.map((row) => [...row]);
    emptyCells.forEach(([row, col]) => {
        puzzle[row][col] = 0;
    });

    return { puzzle, solution: solvedBoard, difficulty: 'easy' };
};

const renderGame = async (fixture) => {
    if (fixture) {
        createPuzzle.mockImplementationOnce(() => fixture);
    }
    render(<SudokuGame />);
    await screen.findAllByRole('textbox');
};

afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
});

describe('Sudoku game interface', () => {
    test('renders 81 labeled cells with 40 locked clues and both controls', async () => {
        await renderGame();

        const cells = getCells();
        expect(cells).toHaveLength(81);
        expect(cells.filter((cell) => cell.disabled)).toHaveLength(40);
        expect(cells[0]).toHaveAccessibleName('Row 1, column 1');
        expect(cells.find((cell) => !cell.disabled)).toBeEnabled();
        expect(screen.getByRole('button', { name: 'New Game' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Check Solution' })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Difficulty' })).toHaveValue('easy');
    });

    test('keeps the current game until New Game uses the selected difficulty', async () => {
        await renderGame(createGameFixture());
        const editableCell = screen.getByRole('textbox', { name: 'Row 1, column 1' });
        fireEvent.change(editableCell, { target: { value: '2' } });
        createPuzzle.mockClear();

        fireEvent.change(screen.getByRole('combobox', { name: 'Difficulty' }), {
            target: { value: 'hard' },
        });
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
        });
        expect(editableCell).toHaveValue('2');
        expect(createPuzzle).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'New Game' }));

        expect(createPuzzle).toHaveBeenLastCalledWith('hard');
        expect(getCells().filter((cell) => cell.disabled)).toHaveLength(26);
    });

    test('keeps editable cells limited to digits 1 through 9', async () => {
        await renderGame();

        const cell = getCells().find((candidate) => !candidate.disabled);
        fireEvent.change(cell, { target: { value: 'x' } });
        expect(cell).toHaveValue('');

        fireEvent.change(cell, { target: { value: '7' } });
        expect(cell).toHaveValue('7');
    });

    test.each([
        ['an empty', ''],
        ['an incorrect', '9'],
    ])('uses one hint to fill and lock %s cell', async (_description, initialValue) => {
        await renderGame(createGameFixture([[0, 0], [0, 1]]));
        const hintedCell = screen.getByRole('textbox', { name: 'Row 1, column 1' });
        if (initialValue) {
            fireEvent.change(hintedCell, { target: { value: initialValue } });
        }

        fireEvent.click(screen.getByRole('button', { name: 'Hint' }));

        expect(hintedCell).toHaveValue('1');
        expect(hintedCell).toBeDisabled();
        expect(screen.getByText('Hints used: 1')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Row 1, column 2' })).toBeEnabled();
    });

    test('starts and resets the timer for each game, then stops it on completion', () => {
        const fixture = createGameFixture();
        createPuzzle.mockImplementationOnce(() => fixture);
        jest.useFakeTimers();
        render(<SudokuGame />);
        act(() => {
            jest.advanceTimersByTime(0);
        });

        expect(screen.getByRole('timer')).toHaveTextContent('00:00');
        act(() => {
            jest.advanceTimersByTime(3000);
        });
        expect(screen.getByRole('timer')).toHaveTextContent('00:03');

        fireEvent.change(screen.getByRole('textbox', { name: 'Row 1, column 1' }), {
            target: { value: '1' },
        });
        expect(screen.getByRole('timer')).toHaveTextContent('00:03');
        act(() => {
            jest.advanceTimersByTime(5000);
        });
        expect(screen.getByRole('timer')).toHaveTextContent('00:03');

        fireEvent.click(screen.getByRole('button', { name: 'New Game' }));
        expect(screen.getByRole('timer')).toHaveTextContent('00:00');
        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(screen.getByRole('timer')).toHaveTextContent('00:02');
    });

    test('saves a completed score and displays it in the leaderboard', async () => {
        await renderGame(createGameFixture([[0, 0], [0, 1]]));

        fireEvent.click(screen.getByRole('button', { name: 'Hint' }));
        fireEvent.change(screen.getByRole('textbox', { name: 'Row 1, column 2' }), {
            target: { value: '2' },
        });
        fireEvent.change(screen.getByLabelText('Your name for the Top 10'), {
            target: { value: 'Ada' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Save Score' }));

        expect(screen.getByRole('table', { name: 'Top 10 scores' })).toHaveTextContent(
            'Ada',
        );
        expect(loadLeaderboard()[0]).toMatchObject({
            name: 'Ada',
            time: 0,
            difficulty: 'easy',
            hintsUsed: 1,
        });
    });

    test('toggles between light and dark themes', async () => {
        await renderGame(createGameFixture());

        fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
        expect(document.documentElement.dataset.theme).toBe('dark');
        expect(screen.getByRole('button', { name: 'Switch to light mode' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );

        fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }));
        expect(document.documentElement.dataset.theme).toBe('light');
    });

    test.each([
        ['row', 0, 1, '2'],
        ['column', 1, 0, '4'],
        ['3-by-3 box', 1, 1, '5'],
    ])('immediately highlights a move that conflicts in the same %s', async (_unit, row, col, value) => {
        await renderGame(createGameFixture());

        const cell = screen.getByRole('textbox', { name: 'Row 1, column 1' });
        fireEvent.change(cell, { target: { value } });

        expect(cell).toHaveAttribute('aria-invalid', 'true');
        expect(cell.className).toContain('incorrect');
        expect(screen.getByRole('status')).not.toHaveTextContent('Congratulations!');
    });

    test('congratulates the player when the final correct cell is entered', async () => {
        await renderGame(createGameFixture());

        fireEvent.change(screen.getByRole('textbox', { name: 'Row 1, column 1' }), {
            target: { value: '1' },
        });

        expect(screen.getByRole('status')).toHaveTextContent(
            'Congratulations! You solved it in',
        );
    });

    test('checks the untouched puzzle and New Game clears the feedback', async () => {
        await renderGame();
        const emptyCell = getCells().find((cell) => !cell.disabled);
        expect(emptyCell).toHaveAttribute('aria-invalid', 'false');

        fireEvent.click(screen.getByRole('button', { name: 'Check Solution' }));
        expect(screen.getByRole('status')).toHaveTextContent('Some cells are incorrect.');
        expect(emptyCell).toHaveAttribute('aria-invalid', 'true');
        expect(document.querySelector('[aria-invalid="true"]')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'New Game' }));
        expect(screen.getByRole('status')).toBeEmptyDOMElement();
        expect(document.querySelector('[aria-invalid="true"]')).not.toBeInTheDocument();
        expect(getCells()).toHaveLength(81);
        expect(getCells().filter((cell) => cell.disabled)).toHaveLength(40);
    });

    test('Check Solution highlights a wrong entry without a move conflict', async () => {
        await renderGame(
            createGameFixture([
                [0, 0],
                [0, 1],
                [3, 0],
                [3, 1],
            ]),
        );
        const cell = screen.getByRole('textbox', { name: 'Row 1, column 1' });
        fireEvent.change(cell, { target: { value: '2' } });
        expect(cell).toHaveAttribute('aria-invalid', 'false');

        fireEvent.click(screen.getByRole('button', { name: 'Check Solution' }));

        expect(cell).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByRole('status')).toHaveTextContent('Some cells are incorrect.');
    });

    test('keeps the current board and shows recovery guidance if New Game fails', async () => {
        await renderGame();
        const currentCells = getCells();
        jest.spyOn(console, 'error').mockImplementation(() => {});
        createPuzzle.mockImplementationOnce(() => {
            throw new Error('Puzzle generation failed.');
        });

        fireEvent.click(screen.getByRole('button', { name: 'New Game' }));

        expect(screen.getByRole('status')).toHaveTextContent(
            'Unable to start a new puzzle. Please try again.',
        );
        expect(getCells()).toHaveLength(81);
        expect(getCells()[0]).toBe(currentCells[0]);
    });

    test('shows route-level recovery and retries when the user requests it', () => {
        const reset = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});

        render(<SudokuPageError error={new Error('Route failed.')} reset={reset} />);

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Unable to load the Sudoku game. Please try again.',
        );
        fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
        expect(reset).toHaveBeenCalledTimes(1);
    });
});
