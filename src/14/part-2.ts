import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

import { Platform } from './platform.js';

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const platform = Platform.createPlatform(input);

	return platform.cycle(1000000000);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(14);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`Sum of results: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
