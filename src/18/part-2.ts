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

const directionMap: Record<string, Direction> = {
	0: 'R',
	1: 'D',
	2: 'L',
	3: 'U'
};

/* ========================================================================== */

// https://www.themathdoctors.org/polygon-coordinates-and-areas/
function parseInstructions(input: string): Instruction[] {
	const lines = input.split('\n');

	return lines.map(line => {
		const { distance, direction } = (
			/#(?<distance>.{5})(?<direction>\d)/.exec(line) as RegExpGroups<
				'direction' | 'distance'
			>
		).groups;

		return {
			direction: directionMap[direction],
			distance: parseInt(distance, 16)
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

	return area + perimeterLength / 2 + 1;
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(18);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`Cubic meters of lava the lagoon can hold: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
