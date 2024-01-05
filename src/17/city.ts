import { Heap } from 'heap-js';

import { Direction, Grid } from '../utils/Grid.ts';

/* ========================================================================== */

type Position = {
	consecutive: number;
	heatLoss: number;
	direction?: Direction;
	index: number;
	previous?: number;
};

/* ========================================================================== */

export class City extends Grid<number> {
	constructor(grid: number[], columns: number) {
		super(grid, columns);
	}

	/* ---------------------------------------------------------------------- */

	static createCity(input: string): City {
		const rows = input.split('\n');
		const columns = rows[0].length;

		const grid: number[] = rows.reduce(
			(grid, row) => [...grid, ...row.split('').map(Number)],
			[]
		);

		return new City(grid, columns);
	}

	/* ---------------------------------------------------------------------- */

	/**
	 * Creates a key for a position. The key needs to include the following
	 * information:
	 * - index
	 *   The position of the cell, this is the most basis.
	 * - direction
	 *   The direction from which the cell was reached. This is needed to allow
	 *   the same cell to be visited from both the horizontal and
	 *   vertical direction;
	 * - steps
	 *   The number of consecutive steps in the same direction. This is needed
	 *   to allow the same cell to be visited with a different number of
	 *   consecutive steps.
	 *
	 * Omitting any of these parts from the key will result in the same cell
	 * being excluded from alternative paths which may not be shortest path but
	 * are still valid given the constraints of consecutive steps.
	 */
	private positionToKey(
		index: number,
		direction: Direction | undefined,
		steps: number
	): string {
		const generalDirection =
			direction === 'down' || direction === 'up' ? 'vertical' : 'horizontal';

		return `${index}-${generalDirection}-${steps.toString()}`;
	}

	private hasVisitedPosition(
		position: Position,
		visited: Set<string>,
		mark = true
	): boolean {
		const key = this.positionToKey(
			position.index,
			position.direction,
			position.consecutive
		);
		// Check if the position has been visited before.
		const result = visited.has(key);
		// Add the key to the visited set, if it is already in there nothing
		// will happen.
		if (mark) {
			visited.add(key);
		}

		return result;
	}

	// eslint-disable-next-line complexity
	public findBestPath() {
		const endPosition = this.grid.length - 1;
		const priorityQueue = new Heap<Position>((a, b) => a.heatLoss - b.heatLoss);
		priorityQueue.push({
			consecutive: 0,
			heatLoss: 0,
			index: 0
		});
		const visited = new Set<string>();

		while (priorityQueue.length) {
			// Get the item with the top priority.
			const position = priorityQueue.pop() as Position;

			// When it is a position that has been visited before, skip it.
			if (this.hasVisitedPosition(position, visited)) {
				continue;
			}

			// End position found, return the cost it took to get there.
			if (position.index === endPosition) {
				return position.heatLoss;
			}

			// Get the neighbors of the current position and iterate over all
			// of them.
			const neighbors = this.getNeighbors(position.index);
			for (const neighbor of neighbors) {
				const {
					direction,
					value: { index, value }
				} = neighbor;
				// The starting cell as has no direction, so we use the
				// direction of the neighbor.
				const sameDirection = (position.direction ?? direction) === direction;
				const newConsecutive = sameDirection ? position.consecutive + 1 : 1;
				const neighborPosition: Position = {
					consecutive: newConsecutive,
					heatLoss: position.heatLoss + value,
					direction,
					index,
					previous: position.index
				};

				if (
					// If the neighbor is the previous cell, skip it.
					position.previous === index ||
					// If the neighbor has already been visited, skip it.
					this.hasVisitedPosition(neighborPosition, visited, false) ||
					// If the neighbor exceeds the number of consecutive steps
					// in the same direction, skip it.
					(position.direction === direction && position.consecutive === 3)
				) {
					continue;
				}

				priorityQueue.push(neighborPosition);
			}
		}

		return -1;
	}
}
