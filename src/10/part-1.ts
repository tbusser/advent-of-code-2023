import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';
import { initGrid } from './helper.ts';

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const grid = initGrid(input);

	return grid.findMainLoop().steps / 2;
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(10);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(
	`Number of steps along the loop to get to the furthest point: ${result.answer}`
);
console.log(`Time taken: ${result.duration}ms`);
