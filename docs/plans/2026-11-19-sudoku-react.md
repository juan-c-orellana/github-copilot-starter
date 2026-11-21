# Milestone 2: React interface

## Goal and completion checks

Replace the legacy DOM-rendered Sudoku interface with a React 19+ component tree while preserving its current 9x9 board, 35 clues, cell-entry behavior, New Game action, and solution feedback. Keep the current randomized puzzle generation behavior; do not add later-milestone features.

Run `npm test` and `npm run build`. Start the app and verify its rendered board and controls.

## Expected files

- Update `package.json`, `package-lock.json`, `.gitignore`, and `index.html` for a minimal Vite + React runtime.
- Move the game logic from `sudoku.js` into `src/game/sudoku.js`.
- Add `src/main.jsx`, `src/App.jsx`, and focused reusable board, cell, and control modules under `src/components/`.
- Move the existing styles into a CSS Module under `src/`.
- Replace the legacy DOM tests with React/jsdom behavior tests in `tests/`.

## Out of scope

Do not add Next.js in this milestone. Do not change puzzle-generation guarantees, add difficulty selection, timer, hints, leaderboard/localStorage, or redesign the 3x3 box styling. Leave the milestone evidence screenshots untouched.

## Risks

The existing generator randomizes puzzle contents; tests must assert stable observable behavior, not fixed cell positions or puzzle values. Keep the runtime and game logic organized so the next milestone can move the React entry into Next.js without coupling game behavior to Vite.
