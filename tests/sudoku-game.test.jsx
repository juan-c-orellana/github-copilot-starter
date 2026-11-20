import { fireEvent, render, screen } from '@testing-library/react';
import SudokuGame from '../src/App.jsx';

const getCells = () => screen.getAllByRole('textbox');

describe('Sudoku game interface', () => {
    test('renders 81 labeled cells with 35 prefilled clues and both controls', () => {
        render(<SudokuGame />);

        const cells = getCells();
        expect(cells).toHaveLength(81);
        expect(cells.filter((cell) => cell.disabled)).toHaveLength(35);
        expect(cells[0]).toHaveAccessibleName('Row 1, column 1');
        expect(screen.getByRole('button', { name: 'New Game' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Check Solution' })).toBeInTheDocument();
    });

    test('keeps editable cells limited to digits 1 through 9', () => {
        render(<SudokuGame />);

        const cell = getCells().find((candidate) => !candidate.disabled);
        fireEvent.change(cell, { target: { value: 'x' } });
        expect(cell).toHaveValue('');

        fireEvent.change(cell, { target: { value: '7' } });
        expect(cell).toHaveValue('7');
    });

    test('checks the untouched puzzle and New Game clears the feedback', () => {
        render(<SudokuGame />);

        fireEvent.click(screen.getByRole('button', { name: 'Check Solution' }));
        expect(screen.getByRole('status')).toHaveTextContent('Some cells are incorrect.');
        expect(document.querySelector('[aria-invalid="true"]')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'New Game' }));
        expect(screen.getByRole('status')).toBeEmptyDOMElement();
        expect(document.querySelector('[aria-invalid="true"]')).not.toBeInTheDocument();
        expect(getCells()).toHaveLength(81);
        expect(getCells().filter((cell) => cell.disabled)).toHaveLength(35);
    });
});
