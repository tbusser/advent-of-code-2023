import {
	CellNeighbors,
	Direction,
	Grid,
	Neighbor as BaseNeighbor,
	Neighbors as BaseNeighbors
} from '../utils/Grid.ts';

/* ========================================================================== */

type GridId = {
	[direction in Direction]: number;
};

// eslint-disable-next-line complexity
function adjustGridId(
	gridId: GridId | undefined,
	direction: Direction
): GridId | undefined {
	if (gridId === undefined) {
		return undefined;
	}

	const newId = { ...gridId };
	if (direction === 'up') {
		if (newId.down > 0) {
			newId.down -= 1;
		} else {
			newId.up += 1;
		}
	} else if (direction === 'right') {
		if (newId.left > 0) {
			newId.left -= 1;
		} else {
			newId.right += 1;
		}
	} else if (direction === 'down') {
		if (newId.up > 0) {
			newId.up -= 1;
		} else {
			newId.down += 1;
		}
	} else if (direction === 'left') {
		if (newId.right > 0) {
			newId.right -= 1;
		} else {
			newId.left += 1;
		}
	}

	return newId;
}

function gridIdToString(id: GridId): string {
	return `u${id.up}r${id.right}d${id.down}l${id.left}`;
}

/* ========================================================================== */

const tile = {
	pot: '.',
	rock: '#',
	start: 'S'
} as const;
type Tile = (typeof tile)[keyof typeof tile];

type Neighbor<T> = BaseNeighbor<T> & {
	gridId: GridId;
	uniqueId: string;
};
type Neighbors<T> = BaseNeighbors<T> & {
	[direction in Direction]?: Neighbor<T>;
};

type TravelResult = {
	/**
	 * The ID of the grid in which the index is located.
	 */
	gridId: GridId;

	/**
	 * The index in the grid of the tile that was reached.
	 */
	index: number;
};

type QueueItem = {
	gridId: GridId;
	index: number;
	steps: number;
	uniqueId: string;
};

/* ========================================================================== */

export class InfinityGarden extends Grid<Tile> {
	constructor(
		protected grid: Tile[],
		protected columns: number
	) {
		super(grid, columns);
		this._startIndex = this.findStart();
	}

	/* ---------------------------------------------------------------------- */

	static createGarden(input: string): InfinityGarden {
		const lines = input.split('\n');
		const columns = lines[0].length;
		const grid = lines.join('').split('');

		return new InfinityGarden(grid as Tile[], columns);
	}

	/* ---------------------------------------------------------------------- */

	private _startIndex: number;
	public get startIndex(): number {
		return this._startIndex;
	}

	/* ---------------------------------------------------------------------- */

	private findStart(): number {
		return this.grid.indexOf(tile.start);
	}

	private getItemUp(index: number, gridId: GridId): TravelResult {
		const requiresWrapping = index - this.columns < 0;
		const newGridId = requiresWrapping ? adjustGridId(gridId, 'up') : gridId;
		const trueIndex =
			(index + this.grid.length - this.columns) % this.grid.length;

		return {
			gridId: newGridId,
			index: trueIndex
		};
	}

	private getItemRight(index: number, gridId: GridId): TravelResult {
		const coordinate = this.indexToCoordinate(index);

		const requiresWrapping = coordinate.x >= this.columns - 1;
		const newGridId = requiresWrapping ? adjustGridId(gridId, 'right') : gridId;
		const trueIndex =
			coordinate.x === this.columnCount - 1
				? this.coordinateToIndex({ x: 0, y: coordinate.y })
				: index + 1;

		return {
			gridId: newGridId,
			index: trueIndex
		};
	}

	private getItemDown(index: number, gridId: GridId): TravelResult {
		const requiresWrapping = index + this.columns >= this.grid.length;
		const newGridId = requiresWrapping ? adjustGridId(gridId, 'down') : gridId;
		const trueIndex =
			(index + this.grid.length + this.columns) % this.grid.length;

		return {
			gridId: newGridId,
			index: trueIndex
		};
	}

	private getItemLeft(index: number, gridId: GridId): TravelResult {
		const coordinate = this.indexToCoordinate(index);

		const requiresWrapping = coordinate.x <= 0;
		const newGridId = requiresWrapping ? adjustGridId(gridId, 'left') : gridId;
		const trueIndex =
			coordinate.x === 0
				? this.coordinateToIndex({ x: this.columnCount - 1, y: coordinate.y })
				: index - 1;

		return {
			gridId: newGridId,
			index: trueIndex
		};
	}

	/* ---------------------------------------------------------------------- */

	public getNeighbors(index: number, gridId?: GridId): CellNeighbors<Tile> {
		const neighbors: Neighbors<Tile> = {};

		(
			[
				['up', this.getItemUp],
				['right', this.getItemRight],
				['down', this.getItemDown],
				['left', this.getItemLeft]
			] as [Direction, (number, gridId) => TravelResult][]
		).forEach(([direction, travelTo]) => {
			const neighbor = travelTo.call(this, index, gridId) as TravelResult;

			neighbors[direction] = {
				gridId: neighbor.gridId,
				index: neighbor.index,
				uniqueId: `${gridIdToString(neighbor.gridId)}-${neighbor.index}`,
				value: this.grid[neighbor.index]
			};
		});

		return new CellNeighbors<Tile>(neighbors);
	}

	// eslint-disable-next-line complexity
	public walk(maxSteps: number): number {
		const endsOnEvenOrOdd = maxSteps % 2;
		const queue: QueueItem[] = [
			{
				index: this.startIndex,
				steps: 0,
				gridId: { up: 0, right: 0, down: 0, left: 0 },
				uniqueId: `${gridIdToString({ up: 0, right: 0, down: 0, left: 0 })}-${
					this.startIndex
				}`
			}
		];
		const visitedIndexes = new Set<string>();
		const endTiles = new Set<string>();

		// Keep going until the queue is empty.
		while (queue.length > 0) {
			// Remove the first item from the queue.
			const { gridId, index, steps, uniqueId } = queue.shift();

			// The elf will set 64 steps, an even number. This means that only
			// plots visited on an even step can be a plot where the elf can end
			// up after completing it steps.
			if (steps % 2 === endsOnEvenOrOdd) {
				endTiles.add(uniqueId);
			}

			// When the plot is visited on the last step, or it has already
			// been visited before, skip it.
			if (steps === maxSteps || visitedIndexes.has(uniqueId)) {
				continue;
			}
			visitedIndexes.add(uniqueId);

			const neighbors = this.getNeighbors(index, gridId);
			for (const neighbor of neighbors) {
				// Rocks are never valid neighbors, neither are plots that have
				// already been visited.
				if (
					neighbor.value.value === '#' ||
					visitedIndexes.has((neighbor.value as Neighbor<Tile>).uniqueId)
				) {
					continue;
				}

				// Add the plot to the queue.
				queue.push({
					gridId: neighbor.value.gridId,
					index: neighbor.value.index,
					steps: steps + 1,
					uniqueId: (neighbor.value as Neighbor<Tile>).uniqueId
				});
			}
		}

		return endTiles.size;
	}
}
