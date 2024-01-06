import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

import { City } from './city.ts';

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const city = City.createCity(input);

	return city.findBestPath(4, 10);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(17);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`The least heat loss it can incur: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
