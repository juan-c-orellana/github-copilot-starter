import styles from './SudokuGame.module.css';
import SudokuCell from './SudokuCell.jsx';
import { hasConflict } from '../game/sudoku.js';

const SudokuBoard = ({ game, board, checked, completed, hintedCells, onCellChange }) => (
    <div className={styles.board} role="group" aria-label="Sudoku board">
        {board.map((row, rowIndex) => (
            <div className={styles.row} key={rowIndex}>
                {row.map((value, colIndex) => (
                    <SudokuCell
                        col={colIndex}
                        isInvalid={
                            (checked && value !== game.solution[rowIndex][colIndex]) ||
                            hasConflict(board, rowIndex, colIndex)
                        }
                        isDisabled={
                            completed ||
                            game.puzzle[rowIndex][colIndex] !== 0 ||
                            hintedCells[rowIndex][colIndex]
                        }
                        isHinted={hintedCells[rowIndex][colIndex]}
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
