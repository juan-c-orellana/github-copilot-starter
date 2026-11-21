# Copilot instructions

## Project goal

Refactor the legacy Sudoku game into a maintainable, responsive application while preserving the original gameplay and meeting the requirements in `README.md`. Implement only the feature requested in the current task; do not make unrelated changes.

## Target stack

- Use React 19 or newer and Next.js 15 or newer with the App Router.
- Use ES6+ JavaScript modules, `const` and `let`, and arrow functions.
- Handle expected failures with `try`/`catch` and show clear, user-friendly error messages.
- Use CSS Modules for component styling.

## Testing

- Keep automated tests in the root `tests/` directory.
- Use Jest (or a compatible framework already configured in the project).
- Run the relevant tests after every code change and fix regressions before finishing.
- Add or update tests for behavior introduced or changed; keep tests focused on observable behavior.

## Accessibility and appearance

- Meet WCAG 2.1 AA, including keyboard access, semantic markup, labels, visible focus, and sufficient color contrast.
- Support both light and dark color schemes without reducing readability or contrast.
- Keep the layout responsive for mobile and desktop.

## Code style

- Prefer small, clearly named functions and components with a single responsibility.
- Keep game logic separate from presentation and styling.
- Use consistent formatting and descriptive names; avoid unnecessary comments and dependencies.
- Preserve existing behavior unless the current task explicitly changes it.
