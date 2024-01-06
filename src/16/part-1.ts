import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

import { Contraption } from './contraption.ts';

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const city = Contraption.createContraption(input);

	return city.findBestPath();
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(16);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`Number of energized tiles: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
