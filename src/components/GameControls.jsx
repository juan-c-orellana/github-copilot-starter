import styles from './SudokuGame.module.css';

const GameControls = ({
    difficulty,
    hintsUsed,
    isCompleted,
    onHint,
    onDifficultyChange,
    onNewGame,
    onCheckSolution,
    onToggleTheme,
    theme,
}) => (
    <div className={styles.controls}>
        <label className={styles.difficultyControl}>
            Difficulty
            <select
                onChange={(event) => onDifficultyChange(event.currentTarget.value)}
                value={difficulty}
            >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>
        </label>
        <button disabled={isCompleted} onClick={onHint} type="button">
            Hint
        </button>
        <span aria-label="Hints used" className={styles.hintCount}>
            Hints used: {hintsUsed}
        </span>
        <button onClick={onNewGame} type="button">
            New Game
        </button>
        <button onClick={onCheckSolution} type="button">
            Check Solution
        </button>
        <button
            aria-pressed={theme === 'dark'}
            onClick={onToggleTheme}
            type="button"
        >
            Switch to {theme === 'dark' ? 'light' : 'dark'} mode
        </button>
    </div>
);

export default GameControls;
