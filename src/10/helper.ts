enum CellType {
	Ground = '.',
	Horizontal = '-',
	NorthEast = 'L',
	NorthWest = 'J',
	Outside = 'O',
	SouthEast = 'F',
	SouthWest = '7',
	Start = 'S',
	Vertical = '|'
}

type Coordinate = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';

/* ========================================================================== */

const validUpStart = [
	CellType.Start,
	CellType.Vertical,
	CellType.NorthEast,
	CellType.NorthWest
];
const validRightStart = [
	CellType.Start,
	CellType.Horizontal,
	CellType.NorthEast,
	CellType.SouthEast
];
const validDownStart = [
	CellType.Start,
	CellType.Vertical,
	CellType.SouthEast,
	CellType.SouthWest
];
const validLeftStart = [
	CellType.Start,
	CellType.Horizontal,
	CellType.SouthWest,
	CellType.NorthWest
];

const validUpDestination = [
	CellType.Start,
	CellType.Vertical,
	CellType.SouthEast,
	CellType.SouthWest
];
const validRightDestination = [
	CellType.Start,
	CellType.Horizontal,
	CellType.NorthWest,
	CellType.SouthWest
];
const validDownDestination = [
	CellType.Start,
	CellType.Vertical,
	CellType.NorthEast,
	CellType.NorthWest
];
const validLeftDestination = [
	CellType.Start,
	CellType.Horizontal,
	CellType.NorthEast,
	CellType.SouthEast
];

const validationMapping: Record<
	Direction,
	{ sources: CellType[]; destinations: CellType[] }
> = {
	up: { sources: validUpStart, destinations: validUpDestination },
	right: { sources: validRightStart, destinations: validRightDestination },
	down: { sources: validDownStart, destinations: validDownDestination },
	left: { sources: validLeftStart, destinations: validLeftDestination }
};

/* ========================================================================== */

class Grid {
	constructor(
		private cells: string,
		private rowLength: number
	) {
		this.init();
	}

	/* ---------------------------------------------------------------------- */

	private _start: number;
	public get startIndex(): number {
		return this._start;
	}

	/* ---------------------------------------------------------------------- */

	private init() {
		// Apply padding to the grid, this will make it easier to flood fill
		// most of the cells outside of the main loop.
		this.padGrid();
		this._start = this.cells.indexOf('S');
	}

	/* ---------------------------------------------------------------------- */

	private clearNonLoopFilledCells(path: number[]) {
		this.cells = this.cells
			.split('')
			.map((cell, index) => {
				return path.includes(index) ? cell : CellType.Ground;
			})
			.join('');
	}

	/**
	 * Returns an array of index for the neighbors of the provided index that
	 * are cells with ground as their content.
	 */
	private findGroundNeighbors(index: number): number[] {
		const result = [];
		['up', 'right', 'down', 'left'].forEach((direction: Direction) => {
			const neighborIndex = this.getIndexForNeighbor(index, direction);
			if (this.getCellTypeAtIndex(neighborIndex) === CellType.Ground) {
				result.push(neighborIndex);
			}
		});

		return result;
	}

	/**
	 * Returns the index of all cells of the specified type.
	 */
	private findIndexesForCellType(cellType: CellType): number[] {
		return this.cells
			.split('')
			.map((cell, index) => (cell === cellType ? index : undefined))
			.filter(index => index !== undefined);
	}

	/**
	 * Returns the indexes of neighbors that can be traveled to from the
	 * provided index.
	 */
	private findNeighbors(index: number): number[] {
		const result = [];

		['up', 'right', 'down', 'left'].forEach((direction: Direction) => {
			if (this.isValidPath(index, direction)) {
				result.push(this.getIndexForNeighbor(index, direction));
			}
		});

		return result;
	}

	private floodFillGroundCells() {
		// Because the grid has been padded we know for the cell at index 0
		// is a ground cell. This can be used as the starting point for the
		// flood fill algorithm.
		const queue: number[] = [0];
		const visited = new Set<number>();

		while (queue.length > 0) {
			const index = queue.pop();

			this.replaceCellAtIndex(index, CellType.Outside);
			visited.add(index);

			const neighbors = this.findGroundNeighbors(index);
			neighbors.forEach(neighbor => {
				// If the neighbor has already been visited it can be skipped.
				if (visited.has(neighbor)) {
					return;
				}

				queue.push(neighbor);
			});
		}
	}

	private getIndexForNeighbor(index: number, direction: Direction): number {
		switch (direction) {
			case 'up':
				return index - this.rowLength;
			case 'down':
				return index + this.rowLength;
			case 'left':
				return index - 1;
			case 'right':
				return index + 1;
		}
	}

	private getCellTypeAtIndex(index: number): CellType {
		return this.cells[index] as CellType;
	}

	/**
	 * Returns an array of strings, each string represents a row in the grid.
	 */
	private getRows(grid: string = this.cells): string[] {
		const rows = [];
		for (let i = 0; i < grid.length; i += this.rowLength) {
			rows.push(grid.slice(i, i + this.rowLength));
		}

		return rows;
	}

	/**
	 * This method is based on this StackOverflow answer:
	 * https://stackoverflow.com/a/29915728/1244780
	 *
	 * It has been adapted to with the Grid class.
	 */
	private isIndexInsideMainLoop(index: number, vertexes: Coordinate[]): boolean {
		// ray-casting algorithm based on
		// https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html

		const { x, y } = this.indexToCoordinate(index);

		let inside = false;
		for (let i = 0, j = vertexes.length - 1; i < vertexes.length; j = i++) {
			const { x: xi, y: yi } = vertexes[i];
			const { x: xj, y: yj } = vertexes[j];

			const intersect =
				yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
			if (intersect) {
				inside = !inside;
			}
		}

		return inside;
	}

	private isValidPath(index: number, direction: Direction): boolean {
		const sourcePipe = this.getCellTypeAtIndex(index);
		const destinationPipe = this.getCellTypeAtIndex(
			this.getIndexForNeighbor(index, direction)
		);
		const { destinations, sources } = validationMapping[direction];

		return sources.includes(sourcePipe) && destinations.includes(destinationPipe);
	}

	private padGrid() {
		// Get all the rows and add a cell at the start and end of each row.
		const rows = this.getRows().map(row => `.${row}.`);
		// The length of the rows has increased by 2, this needs to be set.
		this.rowLength += 2;
		// Add a row at the top and bottom of the grid.
		rows.unshift('.'.repeat(this.rowLength));
		rows.push('.'.repeat(this.rowLength));
		// Join all the rows back together.
		this.cells = rows.join('');
	}

	private replaceCellAtIndex(index: number, cellType: CellType) {
		this.cells =
			this.cells.slice(0, index) + cellType + this.cells.slice(index + 1);
	}

	/**
	 * Iterates over all cells that are ground cells and checks if they are
	 * inside the main loop. If they are not, the cell is changed to an outside
	 * cell type.
	 */
	private processGroundCells(mainLoop: number[]) {
		// Convert the main loop indexes to coordinates.
		const vertexes: Coordinate[] = mainLoop.map(index =>
			this.indexToCoordinate(index)
		);

		const groundIndexes = this.findIndexesForCellType(CellType.Ground);
		groundIndexes.forEach(index => {
			const isInLoop = this.isIndexInsideMainLoop(index, vertexes);
			if (!isInLoop) {
				this.replaceCellAtIndex(index, CellType.Outside);
			}
		});
	}

	/* ---------------------------------------------------------------------- */

	public findMainLoop(): { steps: number; path: number[] } {
		const queue = [
			{
				previousPosition: this.startIndex,
				position: this.startIndex,
				steps: 1,
				path: [this.startIndex]
			}
		];

		while (queue.length > 0) {
			const { previousPosition, steps, position, path } = queue.pop();
			const neighbors = this.findNeighbors(position);

			// We've reached the end of the loop but only if it is not the last
			// visited tile. Without this check, the first neighbor would
			// already report a solution.
			if (position === this.startIndex && previousPosition !== this.startIndex) {
				// The last item in the path is the start position, this needs
				// to be removed or it will be double in the result.
				path.pop();

				// Lower the number of steps by 1, the last step is to the start
				// position which is already counted in the loop.
				return { steps: steps - 1, path };
			}

			neighbors.forEach(neighbor => {
				// We can't go back to the previous position, this is not a
				// neighbor we have to visit again.
				if (neighbor === previousPosition) {
					return;
				}

				queue.push({
					steps: steps + 1,
					position: neighbor,
					previousPosition: position,
					path: [...path, neighbor]
				});
			});
		}

		// No solution was found.
		return { steps: -1, path: [] };
	}

	/**
	 * Should be run after running markOutsideCells. Returns the number of cells
	 * which are still ground cells. These are the cells inside the main loop.
	 */
	public getNumberOfCellsInMainLoop(): number {
		let count = 0;
		for (const cell of this.cells) {
			if (cell === CellType.Ground) {
				count++;
			}
		}

		return count;
	}

	/**
	 * Converts an index to a X,Y coordinate. The index 0 corresponds to the
	 * coordinate { x: 0, y: 0 }.
	 */
	public indexToCoordinate(index: number): Coordinate {
		const row = Math.floor(index / this.rowLength);
		const column = index % this.rowLength;

		return {
			x: column,
			y: row
		};
	}

	/**
	 * Outputs the current state of the grid to the console.
	 */
	public log() {
		// Replace the lines with their ASCII art counterparts.
		const output = this.cells
			.replaceAll(CellType.Horizontal, '─')
			.replaceAll(CellType.NorthEast, '└')
			.replaceAll(CellType.NorthWest, '┘')
			.replaceAll(CellType.SouthEast, '┌')
			.replaceAll(CellType.SouthWest, '┐')
			.replaceAll(CellType.Vertical, '│');

		console.table(this.getRows(output));
	}

	public markOutsideCells(mainLoop: number[]) {
		this.clearNonLoopFilledCells(mainLoop);
		this.floodFillGroundCells();
		this.processGroundCells(mainLoop);
	}
}

/* ========================================================================== */

export function initGrid(input: string): Grid {
	const rows = input.split('\n');
	const rowLength = rows[0].length;

	return new Grid(rows.join(''), rowLength);
}
