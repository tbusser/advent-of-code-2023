import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

/* ========================================================================== */

type GameSet = {
	blue?: number;
	green?: number;
	red?: number;
};

/* ========================================================================== */

function findDiceCount(sets: GameSet[]): number {
	const result: GameSet = {
		blue: 0,
		green: 0,
		red: 0
	};

	sets.forEach(set => {
		Object.keys(set).forEach(color => {
			if (set[color] > result[color]) {
				result[color] = set[color];
			}
		});
	});

	return result.blue * result.green * result.red;
}

function parseGame(gameLine: string): GameSet[] {
	const sets = gameLine.replace(/game \d+: /i, '').split('; ');

	return sets.map(set => {
		const cubes = set.split(', ');

		return cubes.reduce<GameSet>((result, cube) => {
			const [count, color] = cube.split(' ');
			result[color] = Number(count);

			return result;
		}, {});
	});
}

async function findSolution(input: string): Promise<number> {
	const games = input.split('\n').map(parseGame);

	return games.reduce((total, game) => total + findDiceCount(game), 0);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(2);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`The sum of the IDs of the valid games is: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
