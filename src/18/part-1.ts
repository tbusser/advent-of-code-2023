import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

import { Coordinate } from '../utils/Grid.js';
import { RegExpGroups } from '../utils/types.ts';
import { calculateArea } from './polygon.ts';

/* ========================================================================== */

type Direction = 'U' | 'R' | 'D' | 'L';

type Instruction = {
	direction: Direction;
	distance: number;
};

/* ========================================================================== */

// https://www.themathdoctors.org/polygon-coordinates-and-areas/
function parseInstructions(input: string): Instruction[] {
	const lines = input.split('\n');

	return lines.map(line => {
		const { direction, distance } = (
			/(?<direction>\w) (?<distance>\d+)/.exec(line) as RegExpGroups<
				'direction' | 'distance'
			>
		).groups;

		return {
			direction: direction as Direction,
			distance: Number(distance)
		};
	});
}

/* -------------------------------------------------------------------------- */

async function findSolution(input: string): Promise<number> {
	const instructions = parseInstructions(input);
	const coordinates: Coordinate[] = [];
	let perimeterLength = 0;
	let x = 0;
	let y = 0;

	instructions.forEach(({ direction, distance }) => {
		perimeterLength += distance;

		if (direction === 'U') {
			y -= distance;
		} else if (direction === 'R') {
			x += distance;
		} else if (direction === 'D') {
			y += distance;
		} else {
			x -= distance;
		}

		coordinates.push({ x, y });
	});

	const area = calculateArea(coordinates);

	// A square of (0,0), (0,2), (2,2), and (2,0) would give an area of 4 but
	// that is not what we need to know, for this square we would expect an area
	// of 9. So we add the perimeter length divided by 2 and add 1 to get the
	// correct area.
	// This correction is needed because the calculated area goes through the
	// middle of each block, but we need to know the area of the whole blocks.
	// The plus 1 is needed because even when the elves dig nothing
	// (perimeterLength = 0) there is still 1 block.
	return area + perimeterLength / 2 + 1;
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(18);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`Cubic meters of lava the lagoon can hold: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
