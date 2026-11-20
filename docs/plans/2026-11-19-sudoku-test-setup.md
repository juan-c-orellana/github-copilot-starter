# Milestone 1: Instructions and baseline tests

## Goal and completion checks

Add Copilot instructions and a Jest/jsdom baseline test framework before any game refactor. Verify with `npm test`; report the exact command and passing test count.

## Expected files

- Create `.github/copilot-instructions.md` and root `instruction.md`.
- Create `package.json`, update `.gitignore`, and add baseline tests under `tests/`.
- Add a short Testing section to `README.md`.
- Do not modify `index.html`, `sudoku.js`, or `styles.css`.

## Risks

The game randomizes its board on page load, so tests must assert stable observable behavior rather than particular cell values. Tests must run the existing scripts in jsdom without altering the legacy game.
