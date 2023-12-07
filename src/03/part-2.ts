import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

/* ========================================================================== */

function getNumberAt(grid: string[][], row: number, column: number): number {
	let index = column;
	let result = '';

	// Go to the left until we find a cell which doesn't contain a number;
	while (isNumber(grid, row, index - 1)) {
		index--;
	}

	// From the first number keep going right until we find a cell which doesn't
	// contain a number.
	while (isNumber(grid, row, index)) {
		result += grid[row][index];
		index++;
	}

	return Number(result);
}

function isGear(character: string): boolean {
	return character === '*';
}

function isNumber(grid: string[][], row: number, column: number): boolean {
	const cell = grid[row][column];
	return !isNaN(Number(cell));
}

function isValidGear(parts: number[]): boolean {
	return parts.length === 2;
}

function getPartsForGear(grid: string[][], row: number, column: number): number[] {
	const parts = [];
	const canGoUp = grid[row - 1] !== undefined
	const canGoDown = grid[row + 1] !== undefined;
	const canGoLeft = grid[row][column - 1] !== undefined;
	const canGoRight = grid[row][column + 1] !== undefined;

	if (canGoUp) {
		// If the field directly above is a number, there is no need to check
		// the diagonal fields. If any of the diagonal fields are numbers, they
		// will be part of the same number as the field directly above.
		if (isNumber(grid, row - 1, column)) {
			parts.push(getNumberAt(grid, row - 1, column));
		}
		else {
			if (isNumber(grid, row - 1, column - 1)){
				parts.push(getNumberAt(grid, row - 1, column - 1));
			}
			if (isNumber(grid, row - 1, column + 1)){
				parts.push(getNumberAt(grid, row - 1, column + 1));
			}
		}
	}

	if (canGoDown) {
		// If the field directly below is a number, there is no need to check
		// the diagonal fields. If any of the diagonal fields are numbers, they
		// will be part of the same number as the field directly below.
		if (isNumber(grid, row + 1, column)) {
			parts.push(getNumberAt(grid, row + 1, column));
		}
		else {
			if (isNumber(grid, row + 1, column - 1)){
				parts.push(getNumberAt(grid, row + 1, column - 1));
			}
			if (isNumber(grid, row + 1, column + 1)){
				parts.push(getNumberAt(grid, row + 1, column + 1));
			}
		}
	}

	if (canGoLeft && isNumber(grid, row, column - 1)) {
		parts.push(getNumberAt(grid, row, column - 1));
	}

	if (canGoRight && isNumber(grid, row, column + 1)) {
		parts.push(getNumberAt(grid, row, column + 1));
	}

	return parts;
}

function getGearRatiosForRow(grid: string[][], row: number): number[] {
	const ratios = []
	grid[row].forEach((cell, column) => {
		if (isGear(cell)) {
			const gearParts = getPartsForGear(grid, row, column);
			if (isValidGear(gearParts)) {
				ratios.push(gearParts[0] * gearParts[1]);
			}
		}
	});

	return ratios;
}

async function findSolution(input: string): Promise<number> {
	const lines = input.split('\n');
	const grid = lines.map((line) => line.split(''));

	let gearRatios: number[] = [];
	for (let row = 0; row < grid.length; row++) {
		const ratios = getGearRatiosForRow(grid, row);
		if (ratios.length > 0) {
			gearRatios = [...gearRatios, ...ratios];
		}
	}

	return gearRatios.reduce((total, part) => total + part, 0);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(3);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`The sum of the IDs of the valid games is: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
