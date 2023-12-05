import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const lines = input.split('\n');

	return lines.reduce((total, line) => {
		const numbers = line.replace(/\D/g, '');
		const lineTotal = parseInt(`${numbers.at(0)}${numbers.at(-1)}`, 10);

		console.log(line, numbers, lineTotal);

		return total + lineTotal;
	}, 0);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(1);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`The sum of all of the calibration values is: ${result.answer}.`);
console.log(`Time taken: ${result.duration}ms`);
