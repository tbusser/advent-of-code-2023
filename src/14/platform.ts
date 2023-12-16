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
	constructor(grid: string, columnCount: number) {
		this.init(grid, columnCount);

		this.cubeRocks = this.identifyCubeRocks();
	}

	/* ---------------------------------------------------------------------- */

	static createPlatform(input: string): Platform {
		const rows = input.split('\n');
		const columnCount = rows[0].length;

		return new Platform(rows.join(''), columnCount);
	}

	/* ---------------------------------------------------------------------- */

	private cells: string[];
	private columnCount: number;
	private cubeRocks: Coordinate[];
	private rowCount: number;

	/* ---------------------------------------------------------------------- */

	private identifyCubeRocks(): Coordinate[] {
		return this.cells.reduce((cubeRocks, cell, index) => {
			if (cell === cubeRock) {
				cubeRocks.push(this.indexToCoordinate(index));
			}

			return cubeRocks;
		}, []);
	}

	private init(grid: string, columnCount: number) {
		const { paddedGrid, paddedColumCount } = this.padGrid(grid, columnCount);

		this.columnCount = paddedColumCount;
		this.cells = paddedGrid.split('');
		this.rowCount = this.cells.length / this.columnCount;
	}

	/* ---------------------------------------------------------------------- */

	private padGrid(
		grid: string,
		columnCount: number
	): { paddedGrid: string; paddedColumCount: number } {
		const paddedColumCount = columnCount + 2;

		const rows = this.getRows(grid.split(''), columnCount);
		const paddedRow = rows.map(row => `${cubeRock}${row.join('')}${cubeRock}`);

		const rockRow = cubeRock.repeat(paddedColumCount);
		const paddedGrid = `${rockRow}${paddedRow.join('')}${rockRow}`;

		return {
			paddedGrid,
			paddedColumCount
		};
	}

	/* ---------------------------------------------------------------------- */

	private distributeRocks(
		countPerCube: Map<Coordinate, number>,
		getIndex: (cubeRock: Coordinate, index: number) => number
	) {
		countPerCube.forEach((count, cubeRock) => {
			for (let index = 0; index < count; index++) {
				const cellIndex = getIndex(cubeRock, index);
				this.cells[cellIndex] = roundedRock;
			}
		});
	}

	/**
	 * Returns an array of strings, each string represents a row in the grid.
	 */
	private getRows(cells: string[], columnCount): string[][] {
		const rows = [];

		for (let i = 0; i < cells.length; i += columnCount) {
			rows.push(cells.slice(i, i + columnCount));
		}

		return rows;
	}

	/* ---------------------------------------------------------------------- */

	public calculateLoad(): number {
		return this.cells.reduce((total, rock, index) => {
			if (rock !== roundedRock) {
				return total;
			}

			const rockCoordinate = this.indexToCoordinate(index);

			const load = this.rowCount - 1 - rockCoordinate.y;

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

	public coordinateToIndex(coordinate: Coordinate): number {
		const row = coordinate.y * this.columnCount;

		return row + coordinate.x;
	}

	public log() {
		const rows = this.getRows(this.cells, this.columnCount);
		console.table(rows);
	}

	public moveRocksNorth() {
		const rocksPerCube: Map<Coordinate, number> = new Map();

		this.cells.forEach((cell, index) => {
			if (cell !== roundedRock) {
				return;
			}

			const cellCoordinate = this.indexToCoordinate(index);
			const destination = this.cubeRocks.findLast(cubeRock => {
				// Exclude the last row and excludes cube rocks in a
				// different column.
				if (cubeRock.y === this.rowCount - 1 || cubeRock.x !== cellCoordinate.x) {
					return false;
				}

				return cubeRock.y < cellCoordinate.y;
			});

			if (destination === undefined) {
				console.log('No destination found for: ', cellCoordinate);

				return;
			}

			rocksPerCube.set(destination, (rocksPerCube.get(destination) ?? 0) + 1);
			this.cells[index] = emptySpace;
		});

		this.distributeRocks(rocksPerCube, (cubeRock: Coordinate, index: number) => {
			const destination = { ...cubeRock };
			destination.y = destination.y + 1 + index;

			return this.coordinateToIndex(destination);
		});
	}

	public moveRocksEast() {
		const rocksPerCube: Map<Coordinate, number> = new Map();

		this.cells.forEach((cell, index) => {
			if (cell !== roundedRock) {
				return;
			}

			const cellCoordinate = this.indexToCoordinate(index);
			const destination = this.cubeRocks.find(cubeRock => {
				// Exclude the last row and excludes cube rocks in a
				// different column.
				if (cubeRock.x === 0 || cubeRock.y !== cellCoordinate.y) {
					return false;
				}

				return cubeRock.x > cellCoordinate.x;
			});

			if (destination === undefined) {
				console.log('No destination found for: ', cellCoordinate);

				return;
			}

			rocksPerCube.set(destination, (rocksPerCube.get(destination) ?? 0) + 1);
			this.cells[index] = emptySpace;
		});

		this.distributeRocks(rocksPerCube, (cubeRock: Coordinate, index: number) => {
			const destination = { ...cubeRock };
			destination.x = destination.x - 1 - index;

			return this.coordinateToIndex(destination);
		});
	}

	public moveRocksSouth() {
		const rocksPerCube: Map<Coordinate, number> = new Map();

		this.cells.forEach((cell, index) => {
			if (cell !== roundedRock) {
				return;
			}

			const cellCoordinate = this.indexToCoordinate(index);
			const destination = this.cubeRocks.find(cubeRock => {
				// Exclude the last row and excludes cube rocks in a
				// different column.
				if (cubeRock.y === 0 || cubeRock.x !== cellCoordinate.x) {
					return false;
				}

				return cubeRock.y > cellCoordinate.y;
			});

			if (destination === undefined) {
				console.log('No destination found for: ', cellCoordinate);

				return;
			}

			rocksPerCube.set(destination, (rocksPerCube.get(destination) ?? 0) + 1);
			this.cells[index] = emptySpace;
		});

		this.distributeRocks(rocksPerCube, (cubeRock: Coordinate, index: number) => {
			const destination = { ...cubeRock };
			destination.y = destination.y - 1 - index;

			return this.coordinateToIndex(destination);
		});
	}

	public moveRocksWest() {
		const rocksPerCube: Map<Coordinate, number> = new Map();

		this.cells.forEach((cell, index) => {
			if (cell !== roundedRock) {
				return;
			}

			const cellCoordinate = this.indexToCoordinate(index);
			const destination = this.cubeRocks.findLast(cubeRock => {
				// Exclude the last row and excludes cube rocks in a
				// different column.
				if (
					cubeRock.x === this.columnCount - 1 ||
					cubeRock.y !== cellCoordinate.y
				) {
					return false;
				}

				return cubeRock.x < cellCoordinate.x;
			});

			if (destination === undefined) {
				console.log('No destination found for: ', cellCoordinate);

				return;
			}

			rocksPerCube.set(destination, (rocksPerCube.get(destination) ?? 0) + 1);
			this.cells[index] = emptySpace;
		});

		this.distributeRocks(rocksPerCube, (cubeRock: Coordinate, index: number) => {
			const destination = { ...cubeRock };
			destination.x = destination.x + 1 + index;

			return this.coordinateToIndex(destination);
		});
	}

	public cycle(spins: number) {
		const hashes: Record<string, number> = {};
		const loads: number[] = [];
		let cycleCount = 0;
		let hashClashIndex = undefined;

		while (hashClashIndex === undefined) {
			// Start by upping the cycle count.
			cycleCount++;

			// Tilt the platform in all directions.
			this.moveRocksNorth();
			this.moveRocksWest();
			this.moveRocksSouth();
			this.moveRocksEast();

			// Greate a string of the current grid state.
			const hash = this.cells.join('');
			// Check if the hash has been seen before.
			hashClashIndex = hashes[hash];

			// When the hash hasn't been seen before, store it.
			if (hashClashIndex === undefined) {
				hashes[hash] = cycleCount;
				loads[cycleCount] = this.calculateLoad();
			}
		}

		// Calculate the index of the load that will be returned.
		const loadIndex =
			((spins - hashClashIndex) % (cycleCount - hashClashIndex)) + hashClashIndex;

		return loads[loadIndex];
	}
}
