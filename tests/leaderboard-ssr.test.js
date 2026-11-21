/** @jest-environment node */

import { loadLeaderboard, saveLeaderboardScore } from '../src/game/leaderboard.js';

describe('leaderboard server rendering safety', () => {
    test('loads an empty leaderboard when there is no browser window', () => {
        expect(loadLeaderboard()).toEqual([]);
    });

    test('does not attempt to save scores outside the browser', () => {
        expect(() =>
            saveLeaderboardScore({
                name: 'Ada',
                time: 42,
                difficulty: 'easy',
                hintsUsed: 0,
            }),
        ).toThrow('The leaderboard is unavailable outside the browser.');
    });
});
