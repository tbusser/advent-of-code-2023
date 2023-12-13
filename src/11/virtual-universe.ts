type Coordinate = { x: number; y: number };

/* ========================================================================== */

const galaxy = '#';

/* ========================================================================== */

/**
 * The VirtualUniverse does the same as the Universe class except it doesn't
 * try to expand the cells to the proper size. Instead it keeps track of the
 * empty rows and columns and uses that information to calculate the coordinate
 * of a galaxy.
 */
export class VirtualUniverse {
	constructor(
		private cells: string,
		private rowLength: number,
		private expansionRate: number
	) {
		this.emptyColumns = this.findEmptyColumns();
		this.emptyRows = this.findEmptyRows();

		this.galaxyIndexes = this.identifyGalaxies();
	}

	/* ---------------------------------------------------------------------- */

	static createUniverse(input: string, expansionRate: number): VirtualUniverse {
		const rows = input.split('\n');
		const rowLength = rows[0].length;

		return new VirtualUniverse(rows.join(''), rowLength, expansionRate);
	}

	/* ---------------------------------------------------------------------- */

	private emptyColumns: number[];
	private emptyRows: number[];
	private galaxyIndexes: Coordinate[];

	/* ---------------------------------------------------------------------- */

	private calculateDistance(
		source: Coordinate,
		destination: Coordinate
	): number {
		return (
			Math.abs(source.y - destination.y) + Math.abs(source.x - destination.x)
		);
	}

	private findEmptyColumns(): number[] {
		const emptyColumns = [];
		// Iterate over all the columns and keep track of the columns which
		// contain only empty space.
		for (let column = 0; column < this.rowLength; column++) {
			// Get all the cells in the current column.
			const columnCells = Array.from(this.walkColumn(column));
			if (!columnCells.some(cell => cell === galaxy)) {
				emptyColumns.push(column);
			}
		}

		return emptyColumns;
	}

	/**
	 * Returns the indexes of the rows which are empty.
	 */
	private findEmptyRows(): number[] {
		const rows = this.getRows();
		const emptyRows = [];

		// Take care of the vertical expansion first.
		rows.forEach((row, index) => {
			if (row.indexOf(galaxy) === -1) {
				emptyRows.push(index);
			}
		});

		return emptyRows;
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

	private identifyGalaxies(): Coordinate[] {
		return (
			this.cells
				// Convert the string to an array of characters.
				.split('')
				// Reduce the cells to an array of indexes of cells which
				// contain a galaxy.
				.reduce((galaxies, cell, index) => {
					if (cell === galaxy) {
						galaxies.push(index);
					}

					return galaxies;
				}, [])
				// Convert the indexes of the galaxies to coordinates.
				.map(index => this.indexToCoordinate(index))
		);
	}

	private *walkColumn(column: number) {
		let index = column;

		while (index < this.cells.length) {
			yield this.cells[index];
			index += this.rowLength;
		}

		return null;
	}

	/* ---------------------------------------------------------------------- */

	public calculate(): number {
		let totalDistance = 0;
		for (
			let sourceIndex = 0;
			sourceIndex < this.galaxyIndexes.length - 1;
			sourceIndex++
		) {
			for (
				let destinationIndex = sourceIndex + 1;
				destinationIndex < this.galaxyIndexes.length;
				destinationIndex++
			) {
				totalDistance += this.calculateDistance(
					this.galaxyIndexes[sourceIndex],
					this.galaxyIndexes[destinationIndex]
				);
			}
		}

		return totalDistance;
	}

	/**
	 * Converts an index to a X,Y coordinate. The index 0 corresponds to the
	 * coordinate { x: 0, y: 0 }.
	 */
	public indexToCoordinate(index: number): Coordinate {
		const row = Math.floor(index / this.rowLength);
		const column = index % this.rowLength;

		// Find the number of empty rows and columns before the current row and
		// column. For each empty row/column we have to take the expansion rate
		// into consideration.
		const emptyRowsBeforeIndex = this.emptyRows.filter(
			emptyRow => emptyRow < row
		).length;
		const emptyColumnsBeforeIndex = this.emptyColumns.filter(
			emptyColumn => emptyColumn < column
		).length;

		// Calculate the number of empty columns before the current column. We
		// need to subtract 1 from the expansion rate because the column itself
		// is already counted.
		const columnOffset = emptyColumnsBeforeIndex * (this.expansionRate - 1);
		const rowOffset = emptyRowsBeforeIndex * (this.expansionRate - 1);

		return {
			x: column + columnOffset,
			y: row + rowOffset
		};
	}

	/**
	 * Outputs the original state of the universe, without taking the expansion
	 * into consideration, to the console.
	 */
	public log() {
		const rows = this.getRows();
		console.table(rows);
	}
}
