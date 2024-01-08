import { Direction } from '../utils/Grid.ts';
import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

import { Contraption } from './contraption.ts';

/* ========================================================================== */

type StartingPosition = {
	index: number;
	direction: Direction;
};

/* ========================================================================== */

function getStartingPositions(
	rows: number,
	columns: number
): StartingPosition[] {
	const bottomRow: StartingPosition[] = Array(columns)
		.fill((rows - 1) * columns)
		.map((value, index) => ({ index: value + index, direction: 'up' }));
	const firstColumn: StartingPosition[] = Array(rows)
		.fill(columns)
		.map((value, index) => ({ index: value * index, direction: 'right' }));
	const lastColumn: StartingPosition[] = Array(rows)
		.fill(columns - 1)
		.map((value, index) => ({
			index: columns * index + value,
			direction: 'left'
		}));
	const topRow: StartingPosition[] = Array(columns)
		.fill(null)
		.map((_, index) => ({ index, direction: 'down' }));

	return [...topRow, ...bottomRow, ...firstColumn, ...lastColumn];
}

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const contraption = Contraption.createContraption(input);
	const startingPositions = getStartingPositions(
		contraption.rowCount,
		contraption.columnCount
	);

	const energizedCounts = startingPositions.map(point =>
		contraption.findBestPath(point.index, point.direction)
	);

	return Math.max(...energizedCounts);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(16);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`Number of energized tiles: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
