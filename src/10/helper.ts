enum PipeType {
	Horizontal = '-',
	NorthEast = 'L',
	NorthWest = 'J',
	SouthEast = 'F',
	SouthWest = '7',
	Start = 'S',
	Vertical = '|'
}

type Direction = 'up' | 'down' | 'left' | 'right';

/* ========================================================================== */

const validUpStart = [
	PipeType.Start,
	PipeType.Vertical,
	PipeType.NorthEast,
	PipeType.NorthWest
];
const validRightStart = [
	PipeType.Start,
	PipeType.Horizontal,
	PipeType.NorthEast,
	PipeType.SouthEast
];
const validDownStart = [
	PipeType.Start,
	PipeType.Vertical,
	PipeType.SouthEast,
	PipeType.SouthWest
];
const validLeftStart = [
	PipeType.Start,
	PipeType.Horizontal,
	PipeType.SouthWest,
	PipeType.NorthWest
];

const validUpDestination = [
	PipeType.Start,
	PipeType.Vertical,
	PipeType.SouthEast,
	PipeType.SouthWest
];
const validRightDestination = [
	PipeType.Start,
	PipeType.Horizontal,
	PipeType.NorthWest,
	PipeType.SouthWest
];
const validDownDestination = [
	PipeType.Start,
	PipeType.Vertical,
	PipeType.NorthEast,
	PipeType.NorthWest
];
const validLeftDestination = [
	PipeType.Start,
	PipeType.Horizontal,
	PipeType.NorthEast,
	PipeType.SouthEast
];

const validationMapping: Record<
	Direction,
	{ sources: PipeType[]; destinations: PipeType[] }
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

	/**
	 * Returns the indexes of empty neighbors that can be traveled to from the
	 * provided index.
	 */
	private findEmptyNeighbors(index: number): number[] {
		const result = [];
		['up', 'right', 'down', 'left'].forEach((direction: Direction) => {
			const position = this.getIndexForNeighbor(index, direction);
			if (this.cells[position] === '.') {
				result.push(position);
			}
		});

		return result;
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

	private getPipeAtIndex(index: number): PipeType {
		return this.cells[index] as PipeType;
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

	private isValidPath(index: number, direction: Direction): boolean {
		const sourcePipe = this.getPipeAtIndex(index);
		const destinationPipe = this.getPipeAtIndex(
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
	 * Converts an index to a X,Y coordinate. The index 0 corresponds to the
	 * coordinate { x: 0, y: 0 }.
	 */
	public indexToCoordinate(index: number): { x: number; y: number } {
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
			.replaceAll(PipeType.Horizontal, '─')
			.replaceAll(PipeType.NorthEast, '└')
			.replaceAll(PipeType.NorthWest, '┘')
			.replaceAll(PipeType.SouthEast, '┌')
			.replaceAll(PipeType.SouthWest, '┐')
			.replaceAll(PipeType.Vertical, '│');

		console.table(this.getRows(output));
	}
}

/* ========================================================================== */

export function initGrid(input: string): Grid {
	const rows = input.split('\n');
	const rowLength = rows[0].length;

	return new Grid(rows.join(''), rowLength);
}
