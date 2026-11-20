import { fireEvent, render, screen } from '@testing-library/react';
import SudokuPageError from '../app/error.jsx';
import SudokuGame from '../src/components/SudokuGame.jsx';
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
    jest.restoreAllMocks();
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

    test('starts a new game with the selected difficulty', async () => {
        await renderGame();

        fireEvent.change(screen.getByRole('combobox', { name: 'Difficulty' }), {
            target: { value: 'hard' },
        });
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
            'Congratulations! You solved it!',
        );
    });

    test('checks the untouched puzzle and New Game clears the feedback', async () => {
        await renderGame();

        fireEvent.click(screen.getByRole('button', { name: 'Check Solution' }));
        expect(screen.getByRole('status')).toHaveTextContent('Some cells are incorrect.');
        expect(document.querySelector('[aria-invalid="true"]')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'New Game' }));
        expect(screen.getByRole('status')).toBeEmptyDOMElement();
        expect(document.querySelector('[aria-invalid="true"]')).not.toBeInTheDocument();
        expect(getCells()).toHaveLength(81);
        expect(getCells().filter((cell) => cell.disabled)).toHaveLength(40);
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
