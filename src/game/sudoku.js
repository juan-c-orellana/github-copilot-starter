const SIZE = 9;
const EMPTY = 0;
const MAX_SOLUTION_SEARCH_NODES = 100_000;
const MAX_GENERATION_ATTEMPTS = 5;
const MAX_GENERATION_SEARCH_NODES = 750_000;
const DIFFICULTY_CLUE_COUNTS = {
    easy: 40,
    medium: 32,
    hard: 26,
};

const copyBoard = (board) => board.map((row) => [...row]);

const createEmptyBoard = () =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));

const hasPeerConflict = (board, row, col, value) => {
    for (let index = 0; index < SIZE; index += 1) {
        if (
            (index !== col && board[row][index] === value) ||
            (index !== row && board[index][col] === value)
        ) {
            return true;
        }
    }

    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
        for (let colOffset = 0; colOffset < 3; colOffset += 1) {
            const otherRow = startRow + rowOffset;
            const otherCol = startCol + colOffset;
            if (
                (otherRow !== row || otherCol !== col) &&
                board[otherRow][otherCol] === value
            ) {
                return true;
            }
        }
    }

    return false;
};

const isSafe = (board, row, col, number) =>
    !hasPeerConflict(board, row, col, number);

export const hasConflict = (board, row, col) =>
    board[row][col] !== EMPTY &&
    hasPeerConflict(board, row, col, board[row][col]);

const validateBoard = (board) => {
    if (
        !Array.isArray(board) ||
        board.length !== SIZE ||
        board.some(
            (row) =>
                !Array.isArray(row) ||
                row.length !== SIZE ||
                row.some(
                    (value) =>
                        !Number.isInteger(value) || value < EMPTY || value > SIZE,
                ),
        )
    ) {
        throw new TypeError('A Sudoku board must be a 9-by-9 grid of digits from 0 to 9.');
    }
};

const findMostConstrainedCell = (board) => {
    let bestCell = null;

    for (let row = 0; row < SIZE; row += 1) {
        for (let col = 0; col < SIZE; col += 1) {
            if (board[row][col] !== EMPTY) {
                continue;
            }

            const candidates = Array.from({ length: SIZE }, (_, index) => index + 1).filter(
                (candidate) => isSafe(board, row, col, candidate),
            );
            if (candidates.length === 0) {
                return { row, col, candidates };
            }
            if (!bestCell || candidates.length < bestCell.candidates.length) {
                bestCell = { row, col, candidates };
                if (candidates.length === 1) {
                    return bestCell;
                }
            }
        }
    }

    return bestCell;
};

const countSolutionsWithBudget = (board, budget) => {
    const searchBoard = copyBoard(board);

    for (let row = 0; row < SIZE; row += 1) {
        for (let col = 0; col < SIZE; col += 1) {
            if (hasConflict(searchBoard, row, col)) {
                return 0;
            }
        }
    }

    const search = () => {
        budget.nodes += 1;
        if (budget.nodes > budget.limit) {
            throw new Error('Sudoku solution search exceeded its safety limit.');
        }

        const cell = findMostConstrainedCell(searchBoard);
        if (!cell) {
            return 1;
        }
        if (cell.candidates.length === 0) {
            return 0;
        }

        let solutions = 0;
        for (const candidate of cell.candidates) {
            searchBoard[cell.row][cell.col] = candidate;
            solutions += search();
            searchBoard[cell.row][cell.col] = EMPTY;
            if (solutions >= 2) {
                return 2;
            }
        }

        return solutions;
    };

    return search();
};

export const countSolutions = (board) => {
    validateBoard(board);
    return countSolutionsWithBudget(board, {
        nodes: 0,
        limit: MAX_SOLUTION_SEARCH_NODES,
    });
};

const shuffle = (items) => {
    for (let index = items.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
    }

    return items;
};

const fillBoard = (board, budget) => {
    budget.nodes += 1;
    if (budget.nodes > budget.limit) {
        throw new Error('Sudoku puzzle generation exceeded its safety limit.');
    }

    for (let row = 0; row < SIZE; row += 1) {
        for (let col = 0; col < SIZE; col += 1) {
            if (board[row][col] !== EMPTY) {
                continue;
            }

            const candidates = shuffle(
                Array.from({ length: SIZE }, (_, index) => index + 1),
            );

            for (const candidate of candidates) {
                if (isSafe(board, row, col, candidate)) {
                    board[row][col] = candidate;
                    if (fillBoard(board, budget)) {
                        return true;
                    }
                    board[row][col] = EMPTY;
                }
            }

            return false;
        }
    }

    return true;
};

const generateAttempt = (difficulty, clueTarget) => {
    const budget = { nodes: 0, limit: MAX_GENERATION_SEARCH_NODES };
    const solution = createEmptyBoard();
    if (!fillBoard(solution, budget)) {
        return null;
    }

    const puzzle = copyBoard(solution);
    const cells = shuffle(
        Array.from({ length: SIZE * SIZE }, (_, index) => ({
            row: Math.floor(index / SIZE),
            col: index % SIZE,
        })),
    );
    let clueCount = SIZE * SIZE;

    for (const { row, col } of cells) {
        if (clueCount === clueTarget) {
            break;
        }

        const value = puzzle[row][col];
        puzzle[row][col] = EMPTY;
        if (countSolutionsWithBudget(puzzle, budget) === 1) {
            clueCount -= 1;
        } else {
            puzzle[row][col] = value;
        }
    }

    if (clueCount !== clueTarget || countSolutionsWithBudget(puzzle, budget) !== 1) {
        return null;
    }

    return { puzzle, solution, difficulty };
};

export const createPuzzle = (difficulty = 'easy') => {
    const clueTarget = DIFFICULTY_CLUE_COUNTS[difficulty];
    if (!Number.isInteger(clueTarget)) {
        throw new RangeError('Choose an Easy, Medium, or Hard Sudoku difficulty.');
    }

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
        const game = generateAttempt(difficulty, clueTarget);
        if (game) {
            return game;
        }
    }

    throw new Error(
        `Unable to generate a unique ${difficulty} Sudoku puzzle after ${MAX_GENERATION_ATTEMPTS} bounded attempts.`,
    );
};

export const isPuzzleSolved = (board, solution) =>
    board.every((row, rowIndex) =>
        row.every((value, colIndex) => value === solution[rowIndex][colIndex]),
    );
