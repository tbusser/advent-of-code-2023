type Coordinate = { x: number; y: number };

/* ========================================================================== */

const emptySpace = '.';

/* ========================================================================== */

export class Universe {
	constructor(
		private cells: string,
		private rowLength: number
	) {
		this.expandUniverse();
		this.galaxyIndexes = this.identifyGalaxies();
	}

	/* ---------------------------------------------------------------------- */

	static createUniverse(input: string): Universe {
		const rows = input.split('\n');
		const rowLength = rows[0].length;

		return new Universe(rows.join(''), rowLength);
	}

	/* ---------------------------------------------------------------------- */

	private galaxyIndexes: number[];

	/* ---------------------------------------------------------------------- */

	private calculateDistance(
		sourceIndex: number,
		destinationIndex: number
	): number {
		const source = this.indexToCoordinate(sourceIndex);
		const destination = this.indexToCoordinate(destinationIndex);

		return (
			Math.abs(source.y - destination.y) + Math.abs(source.x - destination.x)
		);
	}

	private expandUniverseHorizontally() {
		const emptyColumns = this.findEmptyColumns();

		// Going through the empty columns in order will cause the index to
		// become incorrect as for each insertion the original index moves one
		// step to the right. So, we reverse the order of the empty columns so
		// insertions have no effect on the lower indexes.
		emptyColumns.reverse();

		const rows = this.getRows();
		// Loop over all the rows and insert empty space at the empty columns.
		const universe = rows.map(row => {
			emptyColumns.forEach(column => {
				row = row.slice(0, column) + emptySpace + row.slice(column);
			});

			return row;
		});

		return {
			rowLength: this.rowLength + emptyColumns.length,
			universe: universe.join('')
		};
	}

	private expandUniverseVertically() {
		const rows = this.getRows();
		const expandedUniverse: string[] = [];

		// Take care of the vertical expansion first.
		rows.forEach(row => {
			expandedUniverse.push(row);
			if (row.split('').every(cell => cell === emptySpace)) {
				expandedUniverse.push(row);
			}
		});

		return expandedUniverse.join('');
	}

	private expandUniverse() {
		this.cells = this.expandUniverseVertically();
		const { rowLength, universe } = this.expandUniverseHorizontally();

		this.rowLength = rowLength;
		this.cells = universe;
	}

	private findEmptyColumns(): number[] {
		const emptyColumns = [];
		// Iterate over all the columns and keep track of the columns which
		// contain only empty space.
		for (let column = 0; column < this.rowLength; column++) {
			// Get all the cells in the current column.
			const columnCells = Array.from(this.walkColumn(column));
			if (columnCells.every(cell => cell === emptySpace)) {
				emptyColumns.push(column);
			}
		}

		return emptyColumns;
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

	private identifyGalaxies(): number[] {
		return this.cells
			.split('')
			.map((cell, index) => (cell === emptySpace ? null : index))
			.filter(item => item !== null);
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

		return {
			x: column,
			y: row
		};
	}

	/**
	 * Outputs the current state of the universe to the console.
	 */
	public log() {
		const rows = this.getRows();
		console.table(rows);
	}
}
