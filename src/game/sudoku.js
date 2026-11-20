const SIZE = 9;
const EMPTY = 0;
const CLUE_COUNT = 35;

const copyBoard = (board) => board.map((row) => [...row]);

const createEmptyBoard = () =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));

const isSafe = (board, row, col, number) => {
    for (let index = 0; index < SIZE; index += 1) {
        if (board[row][index] === number || board[index][col] === number) {
            return false;
        }
    }

    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
        for (let colOffset = 0; colOffset < 3; colOffset += 1) {
            if (board[startRow + rowOffset][startCol + colOffset] === number) {
                return false;
            }
        }
    }

    return true;
};

const fillBoard = (board) => {
    for (let row = 0; row < SIZE; row += 1) {
        for (let col = 0; col < SIZE; col += 1) {
            if (board[row][col] !== EMPTY) {
                continue;
            }

            const candidates = Array.from({ length: SIZE }, (_, index) => index + 1);
            for (let index = candidates.length - 1; index > 0; index -= 1) {
                const randomIndex = Math.floor(Math.random() * (index + 1));
                [candidates[index], candidates[randomIndex]] = [
                    candidates[randomIndex],
                    candidates[index],
                ];
            }

            for (const candidate of candidates) {
                if (isSafe(board, row, col, candidate)) {
                    board[row][col] = candidate;
                    if (fillBoard(board)) {
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

const removeCells = (board, clueCount) => {
    let remainingCells = SIZE * SIZE - clueCount;

    while (remainingCells > 0) {
        const row = Math.floor(Math.random() * SIZE);
        const col = Math.floor(Math.random() * SIZE);

        if (board[row][col] !== EMPTY) {
            board[row][col] = EMPTY;
            remainingCells -= 1;
        }
    }
};

export const createPuzzle = () => {
    const solution = createEmptyBoard();
    fillBoard(solution);

    const puzzle = copyBoard(solution);
    removeCells(puzzle, CLUE_COUNT);

    return { puzzle, solution };
};

export const isPuzzleSolved = (board, solution) =>
    board.every((row, rowIndex) =>
        row.every((value, colIndex) => value === solution[rowIndex][colIndex]),
    );
