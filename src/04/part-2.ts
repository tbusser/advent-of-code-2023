import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

/* ========================================================================== */

type Game = {
	winningNumbers: number[];
	playerNumbers: number[];
};

type Instance = {
	score: number;
	copies: number;
};

function processLine(line: string): Game {
	const regex = /(\d[\d ]+)(?=\||$)/g;
	const match = line.match(regex);

	return {
		winningNumbers: match[0].trim().split(/\s+/).map(Number),
		playerNumbers: match[1].trim().split(/\s+/).map(Number)
	};
}

function countWinningNumbers(game: Game): Instance {
	return {
		score: game.winningNumbers.filter(number =>
			game.playerNumbers.includes(number)
		).length,
		copies: 1
	};
}

function createCopies(winsPerGame: Instance[], start: number): void {
	let index = start + 1;
	const upperBound = index + winsPerGame[start].score;

	for (index; index < upperBound; index++) {
		if (index < winsPerGame.length) {
			winsPerGame[index].copies += winsPerGame[start].copies;
		}
	}
}
async function findSolution(input: string): Promise<number> {
	const games = input.split('\n').map(processLine);
	const winsPerGame = games.map(countWinningNumbers);
	winsPerGame.forEach((_, index) => createCopies(winsPerGame, index));
	const totalNumberOfCards = winsPerGame.reduce(
		(total, game) => total + game.copies,
		0
	);

	return totalNumberOfCards;
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(4);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`The total number of cards: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
