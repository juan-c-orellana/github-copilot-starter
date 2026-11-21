# Milestone 3: Next.js App Router

## Goal and completion checks

Move the React 19 Sudoku app to the current Next.js App Router without changing gameplay or the existing visual style. Use Next's ESLint configuration and Jest integration, with consistent user-facing error recovery.

Run `npm test`, `npm run lint`, and `npm run build`; start `npm run dev` and verify the app in the browser preview.

## Expected files

- Add `app/layout.jsx`, `app/page.jsx`, `app/globals.css`, and `app/error.jsx`.
- Move the game client and CSS Module to `src/components/SudokuGame.jsx` and `src/components/SudokuGame.module.css`; keep the game logic and reusable controls/board modules.
- Replace Vite entry/runtime with Next.js scripts and dependencies in `package.json`/`package-lock.json`; add `eslint.config.mjs` and `jest.config.cjs`.
- Update the Jest tests/setup, `.gitignore`, and README run/build/test/lint instructions.
- Remove the Vite `index.html` and `src/main.jsx`, Vite-only and Babel/Jest CSS-mock tooling no longer needed, and the unused stylesheet.
- Do not alter the committed Milestone 1 or 2 screenshots.

## Out of scope

Do not add puzzle uniqueness or difficulty selection, hints, timer, scores/localStorage, dark mode, or visual redesign.

## Risks

Next App Router requires the interactive Sudoku game to be a client component. Keep the route layout server-rendered, and preserve the existing user-facing game behavior and CSS Module styling during the migration.
