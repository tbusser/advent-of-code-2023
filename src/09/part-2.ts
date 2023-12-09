import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

/* ========================================================================== */

function calculateTotal(values: number[]): number {
	return values.reduce((total, value) => total + value, 0);
}

function findNextValue(history: string): number {
	// Convert the history to an array of values.
	let current: number[] = history.split(' ').map(Number);
	// Keep track of the first value for each iteration, start with the first
	// value of the input.
	const firstValues = [current[0]];

	// Keep iterating until the difference between all the values is 0 or there
	// is only one value left. At this point we've found all the sequences.
	do {
		// Create a copy of the array to work with.
		const input = [...current];
		// Clear the current array.
		current = [];
		// Iterate over all the values in the array, except the last one as
		// there is no next number to calculate the difference with.
		for (let index = 0; index < input.length - 1; index++) {
			// Push the difference between the value to the current array.
			current.push(input[index + 1] - input[index]);
		}
		// Keep the first value in the array, this will be needed to predict the
		// next value in the sequence.
		firstValues.push(current[0]);
	} while (current.some(value => value !== 0) && current.length > 1);

	// Now we have to work backwards, starting at the first value of the last
	// sequence and working our way back to the first value of the input.
	return firstValues.reduceRight((total, value) => {
		return value - total;
	}, 0);
}

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const histories = input.split('\n');

	// Calculate the predicted next value for each history line.
	const predictions = histories.map(findNextValue);

	// Return the sum of all the predicted values.
	return calculateTotal(predictions);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(9);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`The sum of the extrapolated values is: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
