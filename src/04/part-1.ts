import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

/* ========================================================================== */

type Game = {
	winningNumbers: number[];
	playerNumbers: number[];
};

function processLine(line: string): Game {
	const regex = /(\d[\d ]+)(?=\||$)/g;
	const match = line.match(regex);

	return {
		winningNumbers: match[0].trim().split(/\s+/).map(Number),
		playerNumbers: match[1].trim().split(/\s+/).map(Number)
	};
}

function countWinningNumbers(game: Game): number {
	return game.winningNumbers.filter(number =>
		game.playerNumbers.includes(number)
	).length;
}

function calculateScore(numberOfWins: number): number {
	return numberOfWins < 2 ? numberOfWins : Math.pow(2, numberOfWins - 1);
}

async function findSolution(input: string): Promise<number> {
	const games = input.split('\n').map(processLine);
	const winsPerGame = games.map(countWinningNumbers);
	const scorePerGame = winsPerGame.map(calculateScore);
	const pointsTotal = scorePerGame.reduce((total, score) => total + score, 0);

	return pointsTotal;
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(4);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`The total number of points: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
