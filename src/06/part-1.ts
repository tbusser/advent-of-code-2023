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

function processInput(input: string): Game[] {
	const [timesInput, distancesInput] = input.split('\n');
	const valuesRegex = /\s+([\d\s]+)/
	const times = valuesRegex.exec(timesInput)[1].split(/\s+/).map(Number);
	const distances = valuesRegex.exec(distancesInput)[1].split(/\s+/).map(Number);

	return times.map((time, index) => ({
		distance: distances[index],
		time,
	}));
}

async function findSolution(input: string): Promise<number> {
	const games = processInput(input);

	const waysToWin = games.map(game => {
		const maximumWaitTime = findMaximumWaitTime(game);
		const minimumWaitTime = findMinimumWaitTime(game);

		return maximumWaitTime - minimumWaitTime + 1;
	});

	return waysToWin.reduce((total, ways) => total * ways, 1);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(6);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`The product of ways to win per race: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
