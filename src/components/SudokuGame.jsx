'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import GameControls from './GameControls.jsx';
import SudokuBoard from './SudokuBoard.jsx';
import { loadLeaderboard, saveLeaderboardScore } from '../game/leaderboard.js';
import { createPuzzle, isPuzzleSolved } from '../game/sudoku.js';
import styles from './SudokuGame.module.css';

const copyBoard = (board) => board.map((row) => [...row]);

const formatElapsedTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const SudokuGame = () => {
    const [game, setGame] = useState(null);
    const [board, setBoard] = useState(null);
    const [hintedCells, setHintedCells] = useState(null);
    const [difficulty, setDifficulty] = useState('easy');
    const [checked, setChecked] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [scoreSaved, setScoreSaved] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [theme, setTheme] = useState('light');
    const gameStartedAt = useRef(null);

    const handleNewGame = useCallback(() => {
        try {
            const nextGame = createPuzzle(difficulty);
            gameStartedAt.current = Date.now();
            setGame(nextGame);
            setBoard(copyBoard(nextGame.puzzle));
            setHintedCells(nextGame.puzzle.map((row) => row.map(() => false)));
            setChecked(false);
            setFeedback(null);
            setHintsUsed(0);
            setElapsedSeconds(0);
            setCompleted(false);
            setPlayerName('');
            setScoreSaved(false);
        } catch (error) {
            console.error('Failed to generate a new Sudoku puzzle.', error);
            setFeedback({
                message: 'Unable to start a new puzzle. Please try again.',
                type: 'error',
            });
        }
    }, [difficulty]);

    useEffect(() => {
        if (game) {
            return undefined;
        }

        const timeoutId = window.setTimeout(handleNewGame, 0);
        return () => window.clearTimeout(timeoutId);
    }, [game, handleNewGame]);

    useEffect(() => {
        const timeoutId = window.setTimeout(
            () => setLeaderboard(loadLeaderboard()),
            0,
        );
        return () => window.clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        return () => {
            delete document.documentElement.dataset.theme;
        };
    }, [theme]);

    useEffect(() => {
        if (!game || completed || gameStartedAt.current === null) {
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            setElapsedSeconds(
                Math.floor((Date.now() - gameStartedAt.current) / 1000),
            );
        }, 1000);
        return () => window.clearInterval(intervalId);
    }, [game, completed]);

    const finishGame = (nextBoard, nextHintsUsed = hintsUsed) => {
        if (completed || !isPuzzleSolved(nextBoard, game.solution)) {
            return false;
        }

        const finishedAt = Date.now();
        const finalTime = Math.floor(
            (finishedAt - (gameStartedAt.current ?? finishedAt)) / 1000,
        );
        setElapsedSeconds(finalTime);
        setCompleted(true);
        setFeedback({
            message: `Congratulations! You solved it in ${formatElapsedTime(finalTime)} with ${nextHintsUsed} hint${nextHintsUsed === 1 ? '' : 's'}.`,
            type: 'success',
        });
        return true;
    };

    const handleCellChange = (rowIndex, colIndex, value) => {
        const nextBoard = copyBoard(board);
        nextBoard[rowIndex][colIndex] = value ? Number(value) : 0;
        setBoard(nextBoard);
        if (!finishGame(nextBoard)) {
            setFeedback((currentFeedback) =>
                currentFeedback?.type === 'success' ? null : currentFeedback,
            );
        }
    };

    const handleCheckSolution = () => {
        const solved = isPuzzleSolved(board, game.solution);
        setChecked(true);
        if (!solved) {
            setFeedback({
                message: 'Some cells are incorrect.',
                type: 'error',
            });
        } else {
            finishGame(board);
        }
    };

    const handleHint = () => {
        let targetCell = null;
        for (let rowIndex = 0; rowIndex < board.length && !targetCell; rowIndex += 1) {
            for (
                let colIndex = 0;
                colIndex < board[rowIndex].length;
                colIndex += 1
            ) {
                if (
                    game.puzzle[rowIndex][colIndex] === 0 &&
                    !hintedCells[rowIndex][colIndex] &&
                    board[rowIndex][colIndex] !== 0 &&
                    board[rowIndex][colIndex] !== game.solution[rowIndex][colIndex]
                ) {
                    targetCell = { rowIndex, colIndex };
                    break;
                }
            }
        }

        if (!targetCell) {
            for (let rowIndex = 0; rowIndex < board.length && !targetCell; rowIndex += 1) {
                for (
                    let colIndex = 0;
                    colIndex < board[rowIndex].length;
                    colIndex += 1
                ) {
                    if (
                        game.puzzle[rowIndex][colIndex] === 0 &&
                        !hintedCells[rowIndex][colIndex] &&
                        board[rowIndex][colIndex] === 0
                    ) {
                        targetCell = { rowIndex, colIndex };
                        break;
                    }
                }
            }
        }

        if (!targetCell) {
            setFeedback({
                message: 'No hints are available for this puzzle.',
                type: 'error',
            });
            return;
        }

        const { rowIndex, colIndex } = targetCell;
        const nextBoard = copyBoard(board);
        nextBoard[rowIndex][colIndex] = game.solution[rowIndex][colIndex];
        const nextHintedCells = copyBoard(hintedCells);
        nextHintedCells[rowIndex][colIndex] = true;
        const nextHintsUsed = hintsUsed + 1;
        setBoard(nextBoard);
        setHintedCells(nextHintedCells);
        setHintsUsed(nextHintsUsed);
        if (!finishGame(nextBoard, nextHintsUsed)) {
            setFeedback((currentFeedback) =>
                currentFeedback?.type === 'success' ? null : currentFeedback,
            );
        }
    };

    const handleSaveScore = (event) => {
        event.preventDefault();
        const name = playerName.trim();
        if (!name) {
            return;
        }

        try {
            const nextLeaderboard = saveLeaderboardScore({
                name,
                time: elapsedSeconds,
                difficulty: game.difficulty,
                hintsUsed,
            });
            setLeaderboard(nextLeaderboard);
            setScoreSaved(true);
            setFeedback({
                message: 'Your score was saved to the Top 10.',
                type: 'success',
            });
        } catch (error) {
            console.error('Failed to save the Sudoku score.', error);
            setFeedback({
                message: 'Unable to save your score. Please try again.',
                type: 'error',
            });
        }
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
            <p aria-label="Elapsed time" className={styles.timer} role="timer">
                Time: {formatElapsedTime(elapsedSeconds)}
            </p>
            <SudokuBoard
                board={board}
                checked={checked}
                completed={completed}
                game={game}
                hintedCells={hintedCells}
                onCellChange={handleCellChange}
            />
            <GameControls
                difficulty={difficulty}
                hintsUsed={hintsUsed}
                isCompleted={completed}
                onHint={handleHint}
                onDifficultyChange={setDifficulty}
                onCheckSolution={handleCheckSolution}
                onNewGame={handleNewGame}
                onToggleTheme={() =>
                    setTheme((currentTheme) =>
                        currentTheme === 'light' ? 'dark' : 'light',
                    )
                }
                theme={theme}
            />
            <p
                aria-live="polite"
                className={`${styles.message} ${feedback ? styles[feedback.type] : ''}`}
                role="status"
            >
                {feedback?.message ?? ''}
            </p>
            {completed && !scoreSaved && (
                <form className={styles.nameForm} onSubmit={handleSaveScore}>
                    <label htmlFor="player-name">Your name for the Top 10</label>
                    <input
                        autoComplete="name"
                        id="player-name"
                        maxLength={30}
                        onChange={(event) => setPlayerName(event.currentTarget.value)}
                        required
                        value={playerName}
                    />
                    <button type="submit">Save Score</button>
                </form>
            )}
            <section aria-labelledby="leaderboard-heading" className={styles.leaderboard}>
                <h2 id="leaderboard-heading">Top 10 scores</h2>
                {leaderboard.length === 0 ? (
                    <p>No scores yet.</p>
                ) : (
                    <table aria-label="Top 10 scores">
                        <thead>
                            <tr>
                                <th scope="col">Rank</th>
                                <th scope="col">Name</th>
                                <th scope="col">Time</th>
                                <th scope="col">Difficulty</th>
                                <th scope="col">Hints</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry, index) => (
                                <tr key={`${entry.name}-${entry.time}-${index}`}>
                                    <td>{index + 1}</td>
                                    <td>{entry.name}</td>
                                    <td>{formatElapsedTime(entry.time)}</td>
                                    <td>
                                        {entry.difficulty[0].toUpperCase()}
                                        {entry.difficulty.slice(1)}
                                    </td>
                                    <td>{entry.hintsUsed}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </main>
    );
};

export default SudokuGame;
