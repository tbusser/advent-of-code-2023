import { Direction, Grid } from '../utils/Grid.ts';

/* ========================================================================== */

type Position = {
	direction: Direction;
	index: number;
};

const slantedMirror: Record<Direction, Direction> = {
	up: 'right',
	right: 'up',
	down: 'left',
	left: 'down'
};
const backSlantedMirror: Record<Direction, Direction> = {
	up: 'left',
	right: 'down',
	down: 'right',
	left: 'up'
};

/* ========================================================================== */

export class Contraption extends Grid<string> {
	constructor(grid: string[], columns: number) {
		super(grid, columns);
	}

	/* ---------------------------------------------------------------------- */

	static createContraption(input: string): Contraption {
		const rows = input.split('\n');
		const columns = rows[0].length;

		const grid: string[] = rows.reduce(
			(grid, row) => [...grid, ...row.split('')],
			[] as string[]
		);

		return new Contraption(grid, columns);
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
	 *
	 * Omitting any of these parts from the key will result in the same cell
	 * being excluded from alternative paths which may not be shortest path but
	 * are still valid given the constraints of consecutive steps.
	 */
	private positionToKey(
		index: number,
		direction: Direction | undefined
	): string {
		return `${index}-${direction}`;
	}

	private hasVisitedPosition(
		position: Position,
		visited: Set<string>,
		mark = true
	): boolean {
		const key = this.positionToKey(position.index, position.direction);
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
	private getDirection(currentDirection: Direction, item: string): Direction[] {
		if (item === '/') {
			return [slantedMirror[currentDirection]];
		}
		if (item === '\\') {
			return [backSlantedMirror[currentDirection]];
		}
		if (item === '-') {
			return currentDirection === 'left' || currentDirection === 'right'
				? [currentDirection]
				: ['left', 'right'];
		}

		return currentDirection === 'up' || currentDirection === 'down'
			? [currentDirection]
			: ['up', 'down'];
	}

	// eslint-disable-next-line complexity
	public findBestPath() {
		const queue: Position[] = [{ index: 0, direction: 'right' }];
		const visited = new Set<string>();
		const energized = new Set<number>();

		while (queue.length) {
			// Get the item with the top priority.
			const position = queue.shift() as Position;

			// When it is a position that has been visited before, skip it.
			if (this.hasVisitedPosition(position, visited)) {
				continue;
			}

			energized.add(position.index);

			// Get the neighbors of the current position and iterate over all
			// of them.
			const neighbors = this.getNeighbors(position.index);
			if (this.grid[position.index] === '.') {
				const neighbor = neighbors[position.direction];
				if (neighbor !== undefined) {
					queue.push({
						index: neighbor.index,
						direction: position.direction
					});
				}
			} else {
				const directions = this.getDirection(
					position.direction,
					this.grid[position.index]
				);
				directions.forEach(direction => {
					const neighbor = neighbors[direction];
					if (neighbor !== undefined) {
						queue.push({
							index: neighbor.index,
							direction
						});
					}
				});
			}
		}

		return energized.size;
	}
}
