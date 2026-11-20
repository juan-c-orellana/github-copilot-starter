const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const projectRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const gameScript = fs.readFileSync(path.join(projectRoot, 'sudoku.js'), 'utf8');

const loadGame = () => {
    const dom = new JSDOM(html, { runScripts: 'dangerously' });
    dom.window.eval(gameScript);
    return dom;
};

describe('legacy Sudoku game', () => {
    let dom;

    beforeEach(() => {
        dom = loadGame();
    });

    afterEach(() => {
        dom.window.close();
    });

    test('renders 81 cells with 35 prefilled clues on startup', () => {
        const cells = dom.window.document.querySelectorAll('#sudoku-board input');
        const prefilled = dom.window.document.querySelectorAll('#sudoku-board input:disabled');

        expect(cells).toHaveLength(81);
        expect(prefilled).toHaveLength(35);
    });

    test('New Game replaces the board with a fresh 81-cell board', () => {
        const oldFirstRow = dom.window.document.querySelector('.sudoku-row');

        dom.window.document.querySelector('.controls button').click();

        expect(oldFirstRow.isConnected).toBe(false);
        expect(dom.window.document.querySelectorAll('#sudoku-board input')).toHaveLength(81);
        expect(dom.window.document.querySelectorAll('#sudoku-board input:disabled')).toHaveLength(35);
    });

    test('Check Solution reports an untouched puzzle as incorrect', () => {
        const buttons = dom.window.document.querySelectorAll('.controls button');

        buttons[1].click();

        expect(dom.window.document.querySelector('#message').textContent).toBe('Some cells are incorrect.');
        expect(dom.window.document.querySelector('#sudoku-board .incorrect')).not.toBeNull();
    });
});
