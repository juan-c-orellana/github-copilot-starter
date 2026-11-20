import styles from './SudokuGame.module.css';

const GameControls = ({ onNewGame, onCheckSolution }) => (
    <div className={styles.controls}>
        <button onClick={onNewGame} type="button">
            New Game
        </button>
        <button onClick={onCheckSolution} type="button">
            Check Solution
        </button>
    </div>
);

export default GameControls;
