import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

/* ========================================================================== */

type GameSet = {
	blue?: number;
	green?: number;
	red?: number;
};

/* ========================================================================== */

function isValidGame(game: GameSet[], maxDice: GameSet): boolean {
	return game.every(
		set =>
			(set.blue ?? 0) <= maxDice.blue &&
			(set.green ?? 0) <= maxDice.green &&
			(set.red ?? 0) <= maxDice.red
	);
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

	const maxCubes: Required<GameSet> = {
		blue: 14,
		green: 13,
		red: 12
	};

	return games.reduce<number>(
		(result: number, game: GameSet[], index: number) =>
			isValidGame(game, maxCubes) ? result + index + 1 : result,
		0
	);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(2);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`The sum of the IDs of the valid games is: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
