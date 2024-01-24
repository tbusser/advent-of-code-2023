import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

import { InfinityGarden } from './infinity-garden.js';

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const garden = InfinityGarden.createGarden(input);

	return garden.walk(5000);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(21);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(
	`Number of garden plots the elf can reach in 10 steps: ${result.answer}`
);
console.log(`Time taken: ${result.duration}ms`);
