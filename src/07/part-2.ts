import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';
import {
	groupCards,
	isThreeOfAKind,
	processHand,
	sortHands
} from './joker-scoring.js';

/* ========================================================================== */

type HandInput = {
	bet?: number;
	cards: string;
};

/* ========================================================================== */

function getHands(input: string): HandInput {
	const [cards, bet] = input.split(' ');

	return {
		cards,
		bet: Number(bet)
	};
}

async function findSolution(input: string): Promise<number> {
	const lines = input.split('\n');
	const hands = lines.map(getHands);

	const processedHands = hands.map(hand => processHand(hand.cards, hand.bet));
	sortHands(processedHands);
	console.log(processedHands);
	const winningsPerHand = processedHands.map(
		(hand, index) => hand.betValue * (index + 1)
	);

	return winningsPerHand.reduce((total, winnings) => total + winnings, 0);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(7);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`Total winnings: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
