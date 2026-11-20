# Milestone 5: Hints, timer, leaderboard, and themes

## Goal and completion checks

Add a hint action that fills and locks one correct cell while counting hints, preserve Check Solution highlighting, track and stop elapsed time on completion, prompt for a player name and persist a sorted Top 10, and add an accessible light/dark toggle.

Run `npm test`, `npm run lint`, and `npm run build`. Start `npm run dev` and verify hint use, timer lifecycle, completion/name entry, leaderboard persistence, and theme switching in the browser at `localhost:3000`. Leave the dev server running for the user's screenshot.

## Expected files

- Add `src/game/leaderboard.js` for SSR-safe localStorage loading and score persistence, validation, sorting, and top-10 trimming.
- Update `src/components/SudokuGame.jsx` for hint state, elapsed time, completion/name entry, leaderboard state, and theme state.
- Update `src/components/GameControls.jsx`, `src/components/SudokuBoard.jsx`, and `src/components/SudokuCell.jsx` for hint/check/theme actions and hinted-cell locking.
- Update `src/components/SudokuGame.module.css` and `app/globals.css` for hinted-cell distinction and readable light/dark theme tokens without redesigning layout.
- Update `tests/sudoku-game.test.jsx` and add `tests/leaderboard.test.js` for focused UI and persistence behavior.
- Update `README.md` with the Milestone 5 controls and Top 10 behavior.

## Out of scope

Do not add alternating 3x3 box colors, final responsive polish, or unrelated features. Preserve the existing unique-puzzle generation, difficulty counts, and screenshot evidence. Do not change dependencies or App Router structure.

## Risks

Access to `window`, `document`, and localStorage must remain client-only or guarded for SSR. Missing, blocked, or corrupt storage must not break gameplay; score writes must report failure clearly. Timer state must reset per puzzle and freeze at successful completion. A correct hint must lock the target cell and increment the count exactly once.
