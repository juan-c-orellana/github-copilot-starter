import { countSolutions, createPuzzle, hasConflict } from '../src/game/sudoku.js';

const uniquePuzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

describe('Sudoku solution counting', () => {
    test('returns zero for a contradictory puzzle', () => {
        const contradictoryPuzzle = uniquePuzzle.map((row) => [...row]);
        contradictoryPuzzle[0][2] = 5;

        expect(countSolutions(contradictoryPuzzle)).toBe(0);
    });

    test('returns one for a puzzle with a unique solution', () => {
        expect(countSolutions(uniquePuzzle)).toBe(1);
    });

    test('stops at two when a puzzle has multiple solutions', () => {
        const emptyPuzzle = Array.from({ length: 9 }, () => Array(9).fill(0));

        expect(countSolutions(emptyPuzzle)).toBe(2);
    });
});

describe('difficulty puzzle generation', () => {
    test.each([
        ['easy', 40],
        ['medium', 32],
        ['hard', 26],
    ])('generates a unique %s puzzle with %i clues', (difficulty, clueCount) => {
        const { puzzle, solution } = createPuzzle(difficulty);
        const actualClues = puzzle.flat().filter((value) => value !== 0).length;

        expect(actualClues).toBe(clueCount);
        expect(countSolutions(puzzle)).toBe(1);
        puzzle.forEach((row, rowIndex) =>
            row.forEach((value, colIndex) => {
                if (value !== 0) {
                    expect(value).toBe(solution[rowIndex][colIndex]);
                }
            }),
        );
    });

    test('rejects unsupported difficulty names before searching', () => {
        expect(() => createPuzzle('constructor')).toThrow(RangeError);
    });
});

describe('move conflict detection', () => {
    test.each([
        ['row', 0, 1],
        ['column', 1, 0],
        ['3-by-3 box', 1, 1],
    ])('detects a conflicting value in the same %s', (_unit, row, col) => {
        const board = Array.from({ length: 9 }, () => Array(9).fill(0));
        board[0][0] = 7;
        board[row][col] = 7;

        expect(hasConflict(board, row, col)).toBe(true);
    });
});
