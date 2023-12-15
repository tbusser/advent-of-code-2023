type Coordinate = {
	x: number;
	y: number;
};

type CubeRock = Coordinate & {
	boulders: number;
};

/* ========================================================================== */

const cubeRock = '#';
const roundedRock = 'O';

/* ========================================================================== */

export class Platform {
	constructor(
		private cells: string,
		private columnCount: number
	) {
		this.rowCount = this.cells.length / this.columnCount;
		this.addCubeRockEdge();
		this.identifyCubeRocks();
	}

	/* ---------------------------------------------------------------------- */

	static createPlatform(input: string): Platform {
		const rows = input.split('\n');
		const columnCount = rows[0].length;

		return new Platform(rows.join(''), columnCount);
	}

	/* ---------------------------------------------------------------------- */

	private cubeRocks: CubeRock[];
	private rowCount: number;

	/* ---------------------------------------------------------------------- */

	private addCubeRockEdge() {
		const rockEdge = cubeRock.repeat(this.columnCount);

		this.cells = `${rockEdge}${this.cells}`;
	}

	private identifyCubeRocks() {
		this.cubeRocks = this.cells
			.split('')
			.map((cell, index) => (cell === cubeRock ? index : undefined))
			.filter(item => item !== undefined)
			.map(item => ({ ...this.indexToCoordinate(item), boulders: 0 }))
			.reverse();
	}

	/* ---------------------------------------------------------------------- */

	public calculateLoad(): number {
		return this.cubeRocks.reduce((total, cubeRock) => {
			let load = 0;
			for (let index = 0; index < cubeRock.boulders; index++) {
				load += this.rowCount - cubeRock.y - index;
			}

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
		console.log('Cells: ', this.cells);
		console.log('Columns: ', this.columnCount);
		console.log('Rows: ', this.rowCount);
	}

	public moveRocks() {
		this.cells.split('').forEach((cell, index) => {
			if (cell !== roundedRock) {
				return;
			}

			const coordinate = this.indexToCoordinate(index);
			const cubeRock = this.cubeRocks.find(
				cubeRock => cubeRock.x === coordinate.x && cubeRock.y < coordinate.y
			);
			cubeRock.boulders++;
		});
	}
}
