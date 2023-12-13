import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';
import { Universe } from './universe.ts';

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const universe = Universe.createUniverse(input);

	return universe.calculate();
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(11);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`Sum of the shortest path between every pair: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
