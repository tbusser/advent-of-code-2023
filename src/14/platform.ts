type Coordinate = {
	x: number;
	y: number;
};

/* ========================================================================== */

const cubeRock = '#';
const emptySpace = '.';
const roundedRock = 'O';

/* ========================================================================== */

export class Platform {
	constructor(
		private grid: string,
		private columnCount: number
	) {
		this.rowCount = this.grid.length / this.columnCount;
		this.addCubeRockEdge();

		this.cells = this.grid.split('');
	}

	/* ---------------------------------------------------------------------- */

	static createPlatform(input: string): Platform {
		const rows = input.split('\n');
		const columnCount = rows[0].length;

		return new Platform(rows.join(''), columnCount);
	}

	/* ---------------------------------------------------------------------- */

	private cubes: number[] = [];
	private cells: string[];
	private rowCount: number;

	/* ---------------------------------------------------------------------- */

	private addCubeRockEdge() {
		const rockEdge = cubeRock.repeat(this.columnCount);

		this.grid = `${rockEdge}${this.grid}`;
	}

	private distributeRoundedRocks() {
		this.cubes.forEach((rockCount, cubeIndex) => {
			for (let index = 1; index <= rockCount; index++) {
				this.cells[cubeIndex + index * this.rowCount] = roundedRock;
			}
		});

		this.cubes = [];
	}

	/**
	 * Returns an array of strings, each string represents a row in the grid.
	 */
	private getRows(grid: string[] = this.cells): string[] {
		const rows = [];
		for (let i = 0; i < grid.length; i += this.columnCount) {
			rows.push(grid.slice(i, i + this.rowCount));
		}

		return rows;
	}

	/* ---------------------------------------------------------------------- */

	public calculateLoad(): number {
		return this.cells.reduce((total, cell, index) => {
			if (cell !== roundedRock) {
				return total;
			}

			const load = this.rowCount - Math.floor(index / this.columnCount) + 1;

			return total + load;
		}, 0);
	}

	/**
	 * Converts an index to a X,Y coordinate. The index 0 corresponds to the
	 * coordinate { x: 0, y: 0 }.
	 */
	public indexToCoordinate(index: number): Coordinate {
		const row = Math.floor(index / this.columnCount);
		const column = index % this.columnCount;

		return {
			x: column,
			y: row
		};
	}

	public log() {
		console.log('Cells: ', this.grid);
		console.log('Columns: ', this.columnCount);
		console.log('Rows: ', this.rowCount);
		const rows = this.getRows();
		console.table(rows);
	}

	private findLastIndex<T = unknown>(
		source: T[],
		predicate: (item: T, index: number) => boolean
	): number {
		for (let index = source.length - 1; index >= 0; index--) {
			if (predicate(source[index], index)) {
				return index;
			}
		}

		return -1;
	}

	public moveRocksNorth() {
		console.log('Moving rocks!');
		this.cells.forEach((cell, index) => {
			if (cell !== roundedRock) {
				return;
			}

			const coordinate = this.indexToCoordinate(index);

			const cubeIndex = this.findLastIndex<string>(
				this.cells,
				(cell, cellIndex) =>
					cell === cubeRock &&
					cellIndex < index &&
					cellIndex % this.columnCount === coordinate.x
			);

			this.cubes[cubeIndex] = (this.cubes[cubeIndex] ?? 0) + 1;
			this.cells[index] = emptySpace;
		});

		this.distributeRoundedRocks();
	}
}
