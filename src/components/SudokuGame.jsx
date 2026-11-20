'use client';

import { useCallback, useEffect, useState } from 'react';
import GameControls from './GameControls.jsx';
import SudokuBoard from './SudokuBoard.jsx';
import { createPuzzle, isPuzzleSolved } from '../game/sudoku.js';
import styles from './SudokuGame.module.css';

const copyBoard = (board) => board.map((row) => [...row]);

const SudokuGame = () => {
    const [game, setGame] = useState(null);
    const [board, setBoard] = useState(null);
    const [checked, setChecked] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleNewGame = useCallback(() => {
        try {
            const nextGame = createPuzzle();
            setGame(nextGame);
            setBoard(copyBoard(nextGame.puzzle));
            setChecked(false);
            setFeedback(null);
        } catch (error) {
            console.error('Failed to generate a new Sudoku puzzle.', error);
            setFeedback({
                message: 'Unable to start a new puzzle. Please try again.',
                type: 'error',
            });
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(handleNewGame, 0);
        return () => window.clearTimeout(timeoutId);
    }, [handleNewGame]);

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

    const handleCheckSolution = () => {
        const solved = isPuzzleSolved(board, game.solution);
        setChecked(true);
        setFeedback({
            message: solved ? 'Congratulations! You solved it!' : 'Some cells are incorrect.',
            type: solved ? 'success' : 'error',
        });
    };

    if (!game || !board) {
        return (
            <main className={styles.game}>
                <h1 className={styles.title}>Sudoku Game</h1>
                <p
                    aria-live="polite"
                    className={`${styles.message} ${feedback ? styles[feedback.type] : ''}`}
                    role="status"
                >
                    {feedback?.message ?? 'Loading puzzle...'}
                </p>
                {feedback && (
                    <div className={styles.controls}>
                        <button onClick={handleNewGame} type="button">
                            Try again
                        </button>
                    </div>
                )}
            </main>
        );
    }

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
