import { Grid } from '../utils/Grid.ts';

/* ========================================================================== */

enum TileType {
	Plot = '.',
	Rock = '#',
	Start = 'S',
	Visited = 'O'
}

type QueueItem = {
	index: number;
	steps: number;
};

/* ========================================================================== */

export class Garden extends Grid<TileType> {
	constructor(
		protected grid: TileType[],
		protected columns: number
	) {
		super(grid, columns);
		this._startIndex = this.findStart();
	}

	/* ---------------------------------------------------------------------- */

	static createGarden(input: string): Garden {
		const lines = input.split('\n');
		const columns = lines[0].length;
		const grid = lines.join('').split('');

		return new Garden(grid as TileType[], columns);
	}

	/* ---------------------------------------------------------------------- */

	private _startIndex: number;
	public get startIndex(): number {
		return this._startIndex;
	}

	/* ---------------------------------------------------------------------- */

	private findStart(): number {
		return this.grid.indexOf(TileType.Start);
	}

	/* ---------------------------------------------------------------------- */

	// eslint-disable-next-line complexity
	public walk(maxSteps: number): number {
		const endsOnEvenOrOdd = maxSteps % 2;
		const queue: QueueItem[] = [{ index: this.startIndex, steps: 0 }];
		const visitedIndexes = new Set<number>();
		const endTiles = new Set<number>();

		// Keep going until the queue is empty.
		while (queue.length > 0) {
			// Remove the first item from the queue.
			const { index, steps } = queue.shift();

			// The elf will set 64 steps, an even number. This means that only
			// plots visited on an even step can be a plot where the elf can end
			// up after completing it steps.
			if (steps % 2 === endsOnEvenOrOdd) {
				endTiles.add(index);
			}

			// When the plot is visited on the last step, or it has already
			// been visited before, skip it.
			if (steps === maxSteps || visitedIndexes.has(index)) {
				continue;
			}
			visitedIndexes.add(index);

			const neighbors = this.getNeighbors(index);
			for (const neighbor of neighbors) {
				// Rocks are never valid neighbors, neither are plots that have
				// already been visited.
				if (
					neighbor.value.value === TileType.Rock ||
					visitedIndexes.has(neighbor.value.index)
				) {
					continue;
				}

				// Add the plot to the queue.
				queue.push({
					index: neighbor.value.index,
					steps: steps + 1
				});
			}
		}

		return endTiles.size;
	}
}
