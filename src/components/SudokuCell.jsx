import styles from './SudokuGame.module.css';

const SudokuCell = ({
    row,
    col,
    value,
    isAlternateBox,
    isPrefilled,
    isHinted,
    isDisabled,
    isInvalid,
    onChange,
}) => {
    const className = [
        styles.cell,
        isAlternateBox && styles.alternateBox,
        isPrefilled && styles.prefilled,
        isHinted && styles.hinted,
        isInvalid && styles.incorrect,
    ]
        .filter(Boolean)
        .join(' ');

    const handleChange = (event) => {
        const sanitizedValue = event.currentTarget.value.replace(/[^1-9]/g, '').slice(0, 1);
        onChange(row, col, sanitizedValue);
    };

    return (
        <input
            aria-invalid={isInvalid}
            aria-label={`Row ${row + 1}, column ${col + 1}${isHinted ? ', filled by hint' : ''}`}
            autoComplete="off"
            className={className}
            disabled={isDisabled}
            inputMode="numeric"
            maxLength={1}
            onChange={handleChange}
            type="text"
            value={value === 0 ? '' : String(value)}
        />
    );
};

export default SudokuCell;
