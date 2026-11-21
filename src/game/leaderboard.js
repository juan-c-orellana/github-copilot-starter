const STORAGE_KEY = 'sudoku-top-10';
const MAX_SCORES = 10;
const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

const normalizeScore = (candidate) => {
    if (
        !candidate ||
        typeof candidate.name !== 'string' ||
        !candidate.name.trim() ||
        !Number.isInteger(candidate.time) ||
        candidate.time < 0 ||
        !DIFFICULTIES.has(candidate.difficulty) ||
        !Number.isInteger(candidate.hintsUsed) ||
        candidate.hintsUsed < 0
    ) {
        return null;
    }

    return {
        name: candidate.name.trim(),
        time: candidate.time,
        difficulty: candidate.difficulty,
        hintsUsed: candidate.hintsUsed,
    };
};

const sortAndTrim = (scores) =>
    [...scores]
        .sort(
            (first, second) =>
                first.time - second.time || first.name.localeCompare(second.name),
        )
        .slice(0, MAX_SCORES);

export const loadLeaderboard = () => {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const storedScores = window.localStorage.getItem(STORAGE_KEY);
        if (!storedScores) {
            return [];
        }

        const parsedScores = JSON.parse(storedScores);
        if (!Array.isArray(parsedScores)) {
            return [];
        }

        return sortAndTrim(
            parsedScores.map(normalizeScore).filter((entry) => entry !== null),
        );
    } catch (error) {
        console.error('Unable to read the Sudoku leaderboard.', error);
        return [];
    }
};

export const saveLeaderboardScore = (score) => {
    const normalizedScore = normalizeScore(score);
    if (!normalizedScore) {
        throw new TypeError('Score details are invalid. Please try again.');
    }
    if (typeof window === 'undefined') {
        throw new Error('The leaderboard is unavailable outside the browser.');
    }

    const leaderboard = sortAndTrim([...loadLeaderboard(), normalizedScore]);
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
    } catch (error) {
        console.error('Unable to save the Sudoku leaderboard.', error);
        throw new Error('Unable to save your score. Please try again.');
    }

    return leaderboard;
};
