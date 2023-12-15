import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

/* ========================================================================== */

function hashSequence(sequence: string): number {
	let currentValue = 0;

	for (let index = 0; index < sequence.length; index++) {
		const characterValue = sequence.charCodeAt(index);
		currentValue = ((currentValue + characterValue) * 17) % 256;
	}

	return currentValue;
}

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const sequences = input.split(',');

	return sequences.reduce<number>(
		(total, sequence) => total + hashSequence(sequence),
		0
	);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(15);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`Sum of results: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
