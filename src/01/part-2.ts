import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

/* ========================================================================== */

const regex =
	/^(1|2|3|4|5|6|7|8|9|one|two|three|four|five|six|seven|eight|nine)/g;
const digitLookup = new Map<string, string>([
	['1', '1'],
	['2', '2'],
	['3', '3'],
	['4', '4'],
	['5', '5'],
	['6', '6'],
	['7', '7'],
	['8', '8'],
	['9', '9'],
	['one', '1'],
	['two', '2'],
	['three', '3'],
	['four', '4'],
	['five', '5'],
	['six', '6'],
	['seven', '7'],
	['eight', '8'],
	['nine', '9']
]);

/* ========================================================================== */

function replaceWordsWithNumbers(input: string): string {
	let line = input;
	let result = '';

	// Keep processing the line until the last character has been tested.
	while (line.length > 0) {
		// Try to match the regex against the start of the line.
		const match = line.match(regex);
		// The current line starts with a digit, copy the digit to the result.
		if (match) {
			result += digitLookup.get(match[0]) ?? '';
		}
		// Drop the first character from the line.
		line = line.substring(1);
	}

	return result;
}

async function findSolution(input: string): Promise<number> {
	const lines = input.split('\n').map(line => replaceWordsWithNumbers(line));

	return lines.reduce((total, line) => {
		const lineTotal = parseInt(`${line.at(0)}${line.at(-1)}`, 10);

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
