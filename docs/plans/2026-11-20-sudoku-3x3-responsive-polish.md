# Milestone 6: Alternating boxes and responsive polish

## Goal and completion checks

Add alternating 3×3 box surfaces and finish responsive layout for the existing Sudoku game. Preserve the current gameplay, controls, leaderboard, light/dark themes, and visual identity.

Run `npm test`, `npm run lint`, and `npm run build`. In the browser at `localhost:3000`, verify the board, controls, and leaderboard at 320px, 768px, and desktop width in both themes; check for horizontal page overflow, legible text, visible focus, and distinguishable cell states. Leave the dev server running for Juan's final screenshots.

## Expected files

- `src/components/SudokuBoard.jsx` and `src/components/SudokuCell.jsx`: mark cells by alternating 3×3 box parity.
- `src/components/SudokuGame.module.css`: style alternating boxes and adapt the board, controls, completion form, and leaderboard to narrow viewports.
- `app/globals.css`: add theme-aware box-surface tokens that preserve clue, hint, and invalid-state contrast.
- `tests/sudoku-game.test.jsx`: cover the alternating 3×3 box pattern at the rendered board seam.
- `README.md`: document alternating box surfaces and the responsive layout.

## Do not touch

- Puzzle generation, difficulty/clue counts, hints, timer, completion, leaderboard persistence, and game behavior.
- Milestone 5 screenshot evidence, package dependencies, Next.js setup, or unrelated copy/features.

## Risks

Alternating box treatments must remain visible in both themes without obscuring prefilled, hinted, invalid, or focused cell states. Narrow layouts must keep all controls available, avoid page-level horizontal overflow, and preserve readable leaderboard content and keyboard focus.
