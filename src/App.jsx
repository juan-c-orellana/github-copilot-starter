import React, { useState } from 'react';
import GameControls from './components/GameControls.jsx';
import SudokuBoard from './components/SudokuBoard.jsx';
import { createPuzzle, isPuzzleSolved } from './game/sudoku.js';
import styles from './App.module.css';

const copyBoard = (board) => board.map((row) => [...row]);

const SudokuGame = () => {
    const [game, setGame] = useState(createPuzzle);
    const [board, setBoard] = useState(() => copyBoard(game.puzzle));
    const [checked, setChecked] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleCellChange = (rowIndex, colIndex, value) => {
        setBoard((currentBoard) =>
            currentBoard.map((row, currentRowIndex) =>
                currentRowIndex === rowIndex
                    ? row.map((cell, currentColIndex) =>
                          currentColIndex === colIndex ? (value ? Number(value) : 0) : cell,
                      )
                    : row,
            ),
        );
    };

    const handleNewGame = () => {
        const nextGame = createPuzzle();
        setGame(nextGame);
        setBoard(copyBoard(nextGame.puzzle));
        setChecked(false);
        setFeedback(null);
    };

    const handleCheckSolution = () => {
        const solved = isPuzzleSolved(board, game.solution);
        setChecked(true);
        setFeedback({
            message: solved ? 'Congratulations! You solved it!' : 'Some cells are incorrect.',
            type: solved ? 'success' : 'error',
        });
    };

    return (
        <main className={styles.game}>
            <h1 className={styles.title}>Sudoku Game</h1>
            <SudokuBoard
                board={board}
                checked={checked}
                game={game}
                onCellChange={handleCellChange}
            />
            <GameControls
                onCheckSolution={handleCheckSolution}
                onNewGame={handleNewGame}
            />
            <p
                aria-live="polite"
                className={`${styles.message} ${feedback ? styles[feedback.type] : ''}`}
                role="status"
            >
                {feedback?.message ?? ''}
            </p>
        </main>
    );
};

export default SudokuGame;
