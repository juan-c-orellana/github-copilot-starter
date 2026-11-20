import styles from './SudokuGame.module.css';
import SudokuCell from './SudokuCell.jsx';

const SudokuBoard = ({ game, board, checked, onCellChange }) => (
    <div className={styles.board} role="group" aria-label="Sudoku board">
        {board.map((row, rowIndex) => (
            <div className={styles.row} key={rowIndex}>
                {row.map((value, colIndex) => (
                    <SudokuCell
                        col={colIndex}
                        isIncorrect={checked && value !== game.solution[rowIndex][colIndex]}
                        isPrefilled={game.puzzle[rowIndex][colIndex] !== 0}
                        key={`${rowIndex}-${colIndex}`}
                        onChange={onCellChange}
                        row={rowIndex}
                        value={value}
                    />
                ))}
            </div>
        ))}
    </div>
);

export default SudokuBoard;
