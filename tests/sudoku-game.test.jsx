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

const renderGame = async () => {
    render(<SudokuGame />);
    await screen.findAllByRole('textbox');
};

afterEach(() => {
    jest.restoreAllMocks();
});

describe('Sudoku game interface', () => {
    test('renders 81 labeled cells with 35 prefilled clues and both controls', async () => {
        await renderGame();

        const cells = getCells();
        expect(cells).toHaveLength(81);
        expect(cells.filter((cell) => cell.disabled)).toHaveLength(35);
        expect(cells[0]).toHaveAccessibleName('Row 1, column 1');
        expect(screen.getByRole('button', { name: 'New Game' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Check Solution' })).toBeInTheDocument();
    });

    test('keeps editable cells limited to digits 1 through 9', async () => {
        await renderGame();

        const cell = getCells().find((candidate) => !candidate.disabled);
        fireEvent.change(cell, { target: { value: 'x' } });
        expect(cell).toHaveValue('');

        fireEvent.change(cell, { target: { value: '7' } });
        expect(cell).toHaveValue('7');
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
        expect(getCells().filter((cell) => cell.disabled)).toHaveLength(35);
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
