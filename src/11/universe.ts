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

	static createUniverses(input: string): Universe {
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

		if (source.x === destination.x) {
			return Math.abs(source.y - destination.y);
		} else if (source.y === destination.y) {
			return Math.abs(source.x - destination.x);
		} else {
			return this.findShortestPath(sourceIndex, destinationIndex);
		}
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

	private findShortestPath(
		sourceIndex: number,
		destinationIndex: number
	): number {
		const destinationCoordinate = this.indexToCoordinate(destinationIndex);
		const queue = [
			{
				index: sourceIndex,
				distance: 0
			}
		];
		const visited = new Set<number>();

		while (queue.length > 0) {
			const { index, distance } = queue.pop();
			visited.add(index);

			if (index === destinationIndex) {
				return distance;
			}

			const neighbors = this.getNeighbors(index, destinationCoordinate);
			neighbors.forEach(neighbor => {
				if (visited.has(neighbor)) {
					return;
				}

				queue.push({
					index: neighbor,
					distance: distance + 1
				});
			});
		}
	}

	private getNeighbors(
		sourceIndex: number,
		destinationCoordinate: Coordinate
	): number[] {
		const coordinate = this.indexToCoordinate(sourceIndex);
		const neighbors = [];

		// If we're not at the left edge of the row and destination is to the
		// left of the source, add the neighbor to the left.
		if (coordinate.x > 0 && destinationCoordinate.x < coordinate.x) {
			neighbors.push(sourceIndex - 1);
		}

		// If we're not at the right edge of the row and destination is to the
		// right of the source, add the neighbor to the right.
		if (
			coordinate.x < this.rowLength - 1 &&
			destinationCoordinate.x > coordinate.x
		) {
			neighbors.push(sourceIndex + 1);
		}

		// Check if there is a row below the current row and if so, add it to
		// the neighbors.
		if (this.cells[sourceIndex + this.rowLength] !== undefined) {
			neighbors.push(sourceIndex + this.rowLength);
		}

		return neighbors;
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
