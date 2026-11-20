# Milestone 4: Unique Sudoku puzzles and difficulty

## Goal and completion checks

Replace clue-removal generation with bounded, verified unique-solution puzzles and add Easy, Medium, and Hard selection. Preserve locked clues and New Game behavior, provide immediate conflict feedback, and congratulate only a correctly completed board.

Run `npm test`, `npm run lint`, and `npm run build`. Start `npm run dev` and verify the actual game in the browser at `localhost:3000`, including each difficulty's clue count, clue locking, row/column/box conflicts, and successful completion. Leave the dev server running for the user's screenshot.

## Expected files

- Update `src/game/sudoku.js` with a bounded solution counter, conflict detection, unique puzzle generation, and distinct clue targets: Easy 40, Medium 32, Hard 26.
- Update `src/components/SudokuGame.jsx` and `src/components/GameControls.jsx` for selected difficulty, New Game behavior, and completion feedback.
- Update `src/components/SudokuBoard.jsx`, `src/components/SudokuCell.jsx`, and `src/components/SudokuGame.module.css` for immediate conflict highlighting and accessible invalid state.
- Update `tests/sudoku-game.test.jsx` with focused solver, generation, and UI interaction coverage.
- Update `README.md` to document the difficulty clue counts and generation guarantee.

## Out of scope

Do not add hints, a timer, Top 10/localStorage, dark mode, new 3x3 box styling, or unrelated Next.js changes. Do not alter existing screenshot evidence, dependency manifests, or the App Router.

## Risks

Randomized clue removal can fail to reach a target on a single attempt; use a fixed retry limit and report failure rather than return a puzzle with the wrong clue count. Bound solver search and stop solution counting at two; never treat an incomplete search as proof of uniqueness. Keep generation off the server-render path and preserve the current post-hydration initialization.
