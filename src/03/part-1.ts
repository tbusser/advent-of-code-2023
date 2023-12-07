import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

/* ========================================================================== */

function isCellAdjacentToSymbol(grid: string[][], row: number, column: number): boolean {
	const canGoUp = grid[row - 1] !== undefined
	const canGoDown = grid[row + 1] !== undefined;
	const canGoLeft = grid[row][column - 1] !== undefined;
	const canGoRight = grid[row][column + 1] !== undefined;

	const coordinates = [];
	if (canGoUp) {
		coordinates.push([row - 1, column]);
		if (canGoLeft) {
			coordinates.push([row - 1, column - 1]);
		}
		if (canGoRight) {
			coordinates.push([row - 1, column + 1]);
		}
	}
	if (canGoDown) {
		coordinates.push([row + 1, column]);
		if (canGoLeft) {
			coordinates.push([row + 1, column - 1]);
		}
		if (canGoRight) {
			coordinates.push([row + 1, column + 1]);
		}
	}
	if (canGoLeft) {
		coordinates.push([row, column - 1]);
	}
	if (canGoRight) {
		coordinates.push([row, column + 1]);
	}

	return coordinates.some(coordinate => isSymbol(grid[coordinate[0]][coordinate[1]]));
}

function isSymbol(character: string): boolean {
	return isNaN(Number(character)) && character !== '.';
}

function getPartsFromRow(grid: string[][], row: number): number[] {
	let isNumberPart = false;
	let potentialPartNumber = '';
	const parts = [];

	grid[row].forEach((cell, column) => {
		// Check if the cell is NOT a number
		if (isNaN(Number(cell))) {
			// Check of the potential part number is a valid part number, if it
			// is add it to the parts array.
			if (isNumberPart && potentialPartNumber !== '') {
				parts.push(Number(potentialPartNumber));
				isNumberPart = false;
			}
			// Reset the potential number.
			potentialPartNumber = '';
		} else {
			// The cell is a number, add it to the part number we're processing.
			potentialPartNumber += cell;
			// If we already know it is a part number do nothing, else test if
			// this cell is adjacent to a symbol making the number a valid part.
			isNumberPart = isNumberPart || isCellAdjacentToSymbol(grid, row, column);
		}
	});

	// We've reached the end of the row, check if we were processing a part. If
	// so the part we were processing is valid and should be added to the parts.
	if (isNumberPart) {
		parts.push(Number(potentialPartNumber));
	}

	return parts;
}

async function findSolution(input: string): Promise<number> {
	const lines = input.split('\n');
	const grid = lines.map((line) => line.split(''));

	let parts: number[] = [];
	for (let row = 0; row < grid.length; row++) {
		const rowParts = getPartsFromRow(grid, row);
		if (rowParts.length > 0) {
			parts = [...parts, ...rowParts];
		}
	}

	return parts.reduce((total, part) => total + part, 0);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(3);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`The sum of part numbers is: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
