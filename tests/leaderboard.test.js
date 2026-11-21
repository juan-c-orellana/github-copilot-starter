import { loadLeaderboard, saveLeaderboardScore } from '../src/game/leaderboard.js';

const score = (name, time, difficulty = 'easy', hintsUsed = 0) => ({
    name,
    time,
    difficulty,
    hintsUsed,
});

describe('leaderboard persistence', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('loads an empty leaderboard when no scores are stored', () => {
        expect(loadLeaderboard()).toEqual([]);
    });

    test('sorts by time then name and keeps only the ten fastest scores', () => {
        const existingScores = [
            score('Zoe', 20),
            score('Bea', 30),
            score('Cal', 40),
            score('Dee', 50),
            score('Eli', 60),
            score('Fay', 70),
            score('Gus', 80),
            score('Hal', 90),
            score('Ivy', 100),
            score('Slow', 150),
        ];
        existingScores.forEach((entry) => saveLeaderboardScore(entry));

        const result = saveLeaderboardScore(score('Amy', 20, 'hard', 2));

        expect(result).toHaveLength(10);
        expect(result.map((entry) => entry.name)).toEqual([
            'Amy',
            'Zoe',
            'Bea',
            'Cal',
            'Dee',
            'Eli',
            'Fay',
            'Gus',
            'Hal',
            'Ivy',
        ]);
        expect(result[0]).toEqual(score('Amy', 20, 'hard', 2));
        expect(loadLeaderboard()).toEqual(result);
    });

    test('ignores corrupt persisted JSON without breaking the game', () => {
        const storageError = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('{not json');

        expect(loadLeaderboard()).toEqual([]);
        expect(storageError).toHaveBeenCalled();
    });

    test('handles unavailable storage when reading', () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('Storage is blocked.');
        });

        expect(loadLeaderboard()).toEqual([]);
    });

    test('reports a clear error if a score cannot be persisted', () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('Storage quota reached.');
        });

        expect(() => saveLeaderboardScore(score('Ada', 42))).toThrow(
            'Unable to save your score. Please try again.',
        );
    });
});
