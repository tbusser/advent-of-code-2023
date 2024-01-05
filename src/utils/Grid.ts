type Coordinate = { x: number; y: number };

/**
 * The four cardinal directions.
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Describes a single neighbor of a cell in a grid.
 */
type Neighbor<T> = {
	// The index of the neighbor in the grid.
	index: number;
	// The value of the neighbor in the grid.
	value: T;
};

/**
 * Describes the neighbors of a cell in a grid. Not all the cardinal directions
 * are guaranteed to be present.
 */
type Neighbors<T> = {
	[K in Direction]?: Neighbor<T>;
};

/**
 * A CellNeighbor is a Neighbor with a direction to indicate which way to
 * travel to get to the cell.
 */
type CellNeighbor<T> = { direction: Direction; value: Neighbor<T> };

/**
 * The IterableNeighbors interface describes an object that has the four
 * cardinal directions as properties, and can be iterated over to get the
 * neighbors.
 */
type IterableNeighbors<T> = Neighbors<T> & Iterable<CellNeighbor<T>>;

/* ========================================================================== */

class CellNeighbors<T = string> implements IterableNeighbors<T> {
	constructor(private neighbors: Neighbors<T>) {
		//
	}

	/* ---------------------------------------------------------------------- */

	public get down(): Neighbor<T> | undefined {
		return this.neighbors.down;
	}

	public get left(): Neighbor<T> | undefined {
		return this.neighbors.left;
	}

	public get right(): Neighbor<T> | undefined {
		return this.neighbors.right;
	}

	public get up(): Neighbor<T> | undefined {
		return this.neighbors.up;
	}

	/* ---------------------------------------------------------------------- */

	*[Symbol.iterator]() {
		if (this.up) {
			yield { direction: 'up', value: this.up } as CellNeighbor<T>;
		}
		if (this.right) {
			yield { direction: 'right', value: this.right } as CellNeighbor<T>;
		}
		if (this.down) {
			yield { direction: 'down', value: this.down } as CellNeighbor<T>;
		}
		if (this.left) {
			yield { direction: 'left', value: this.left } as CellNeighbor<T>;
		}

		return null;
	}
}

/* ========================================================================== */

export class Grid<T = string> {
	constructor(
		protected grid: T[],
		protected columns: number
	) {
		//
	}

	/* ---------------------------------------------------------------------- */

	protected getNeighbors(index: number): CellNeighbors<T> {
		const coordinate = this.indexToCoordinate(index);
		const neighbors: Neighbors<T> = {};

		if (index - this.columns >= 0) {
			neighbors.up = {
				index: index - this.columns,
				value: this.grid[index - this.columns]
			};
		}
		if (index + this.columns < this.grid.length) {
			neighbors.down = {
				index: index + this.columns,
				value: this.grid[index + this.columns]
			};
		}
		if (coordinate.x > 0) {
			neighbors.left = {
				index: index - 1,
				value: this.grid[index - 1]
			};
		}
		if (coordinate.x < this.columns - 1) {
			neighbors.right = {
				index: index + 1,
				value: this.grid[index + 1]
			};
		}

		return new CellNeighbors<T>(neighbors);
	}

	protected getRows(): T[][] {
		const rows: T[][] = [];

		for (let i = 0; i < this.grid.length; i += this.columns) {
			rows.push(this.grid.slice(i, i + this.columns));
		}

		return rows;
	}

	/* ---------------------------------------------------------------------- */

	public coordinateToIndex(coordinate: Coordinate): number {
		return coordinate.y * this.columns + coordinate.x;
	}

	/**
	 * Converts an index to a X,Y coordinate. The index 0 corresponds to the
	 * coordinate { x: 0, y: 0 }.
	 */
	public indexToCoordinate(index: number): Coordinate {
		const row = Math.floor(index / this.columns);
		const column = index % this.columns;

		return {
			x: column,
			y: row
		};
	}

	public logGrid() {
		const rows = this.getRows();
		console.table(rows);
	}
}
