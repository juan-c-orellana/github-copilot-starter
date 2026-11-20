import styles from './SudokuGame.module.css';

const SudokuCell = ({ row, col, value, isPrefilled, isIncorrect, onChange }) => {
    const className = [
        styles.cell,
        isPrefilled && styles.prefilled,
        isIncorrect && styles.incorrect,
    ]
        .filter(Boolean)
        .join(' ');

    const handleChange = (event) => {
        const sanitizedValue = event.currentTarget.value.replace(/[^1-9]/g, '').slice(0, 1);
        onChange(row, col, sanitizedValue);
    };

    return (
        <input
            aria-invalid={isIncorrect}
            aria-label={`Row ${row + 1}, column ${col + 1}`}
            autoComplete="off"
            className={className}
            disabled={isPrefilled}
            inputMode="numeric"
            maxLength={1}
            onChange={handleChange}
            type="text"
            value={value === 0 ? '' : String(value)}
        />
    );
};

export default SudokuCell;
