import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

/* ========================================================================== */

type Game = {
	distance: number;
	time: number;
};

/* ========================================================================== */

function calculateDistance(waitTime: number, time: number): number {
	return waitTime * (time - waitTime);
}

function findMaximumWaitTime(game: Game): number {
	for (let waitTime = game.time - 1; waitTime > 0; waitTime--) {
		const distance = calculateDistance(waitTime, game.time);
		if (distance > game.distance) {
			return waitTime;
		}
	}
}
function findMinimumWaitTime(game: Game): number {
	for (let waitTime = 1; waitTime < game.time; waitTime++) {
		const distance = calculateDistance(waitTime, game.time);
		if (distance > game.distance) {
			return waitTime;
		}
	}
}

function processInput(input: string): Game {
	const [timesInput, distancesInput] = input.split('\n');
	const valuesRegex = /\s+([\d\s]+)/;
	const time = Number(valuesRegex.exec(timesInput)[1].replace(/\s+/g, ''));
	const distance = Number(
		valuesRegex.exec(distancesInput)[1].replace(/\s+/g, '')
	);

	return {
		distance,
		time
	};
}

async function findSolution(input: string): Promise<number> {
	const game = processInput(input);

	const maximumWaitTime = findMaximumWaitTime(game);
	const minimumWaitTime = findMinimumWaitTime(game);

	return maximumWaitTime - minimumWaitTime + 1;
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(6);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`The product of ways to win per race: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
