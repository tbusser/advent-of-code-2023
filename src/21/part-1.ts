import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

import { Garden } from './garden.js';

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const garden = Garden.createGarden(input);

	return garden.walk(64);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(21);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(
	`Number of garden plots the elf can reach in 64 steps: ${result.answer}`
);
console.log(`Time taken: ${result.duration}ms`);
