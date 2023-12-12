enum PipeType {
	Vertical = '|',
	Horizontal = '-',
	NorthEast = 'L',
	NorthWest = 'J',
	SouthWest = '7',
	SouthEast = 'F',
	Start = 'S'
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

	public isValidPath(position: number, direction: Direction): boolean {
		const source = this.cells[position] as PipeType;
		const destination = this.cells[
			this.getNeighborIndex(position, direction)
		] as PipeType;

		if (direction === 'up') {
			return (
				validUpStart.includes(source) && validUpDestination.includes(destination)
			);
		}
		if (direction === 'right') {
			return (
				validRightStart.includes(source) &&
				validRightDestination.includes(destination)
			);
		}
		if (direction === 'down') {
			return (
				validDownStart.includes(source) &&
				validDownDestination.includes(destination)
			);
		}

		// Only the left direction is left.
		return (
			validLeftStart.includes(source) && validLeftDestination.includes(destination)
		);
	}

	public canGoDown(index: number): boolean {
		return this.isValidPath(index, 'down');
	}

	public canGoLeft(index: number): boolean {
		return this.isValidPath(index, 'left');
	}

	public canGoRight(index: number): boolean {
		return this.isValidPath(index, 'right');
	}

	public canGoUp(index: number): boolean {
		return this.isValidPath(index, 'up');
	}

	private getNeighborIndex(index: number, direction: Direction): number {
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

	public findNeighbors(index: number): number[] {
		const result = [];

		if (this.canGoUp(index)) {
			result.push(this.getNeighborIndex(index, 'up'));
		}
		if (this.canGoRight(index)) {
			result.push(this.getNeighborIndex(index, 'right'));
		}
		if (this.canGoDown(index)) {
			result.push(this.getNeighborIndex(index, 'down'));
		}
		if (this.canGoLeft(index)) {
			result.push(this.getNeighborIndex(index, 'left'));
		}

		return result;
	}

	private init() {
		this._start = this.cells.indexOf('S');
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
				path.pop();

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

		return { steps: -1, path: [] };
	}

	public indexToPosition(index: number): { x: number; y: number } {
		const row = Math.floor(index / this.rowLength);
		const column = index % this.rowLength;

		return {
			x: column,
			y: row
		};
	}

	public log() {
		let output = this.cells;
		output = output
			.replaceAll('7', '┐')
			.replaceAll('-', '─')
			.replaceAll('J', '┘')
			.replaceAll('F', '┌')
			.replaceAll('L', '└')
			.replaceAll('|', '│');

		const rows = [];
		for (let i = 0; i < output.length; i += this.rowLength) {
			rows.push(output.slice(i, i + this.rowLength));
		}
		console.table(rows);
	}
}

/* ========================================================================== */

export function initGrid(input: string): Grid {
	const rows = input.split('\n');
	const rowLength = rows[0].length;

	return new Grid(rows.join(''), rowLength);
}
