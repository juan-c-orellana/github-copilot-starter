'use client';

import { useEffect } from 'react';
import styles from '../src/components/SudokuGame.module.css';

const SudokuError = ({ error, reset }) => {
    useEffect(() => {
        console.error('Sudoku route error:', error);
    }, [error]);

    return (
        <main className={styles.game}>
            <h1 className={styles.title}>Sudoku Game</h1>
            <p className={styles.error} role="alert">
                Unable to load the Sudoku game. Please try again.
            </p>
            <div className={styles.controls}>
                <button onClick={reset} type="button">
                    Try again
                </button>
            </div>
        </main>
    );
};

export default SudokuError;
