import styles from './SudokuGame.module.css';

const GameControls = ({
    difficulty,
    onDifficultyChange,
    onNewGame,
    onCheckSolution,
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
        <button onClick={onNewGame} type="button">
            New Game
        </button>
        <button onClick={onCheckSolution} type="button">
            Check Solution
        </button>
    </div>
);

export default GameControls;
