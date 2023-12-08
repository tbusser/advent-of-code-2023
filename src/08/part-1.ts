import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

/* ========================================================================== */

function countStepsToEndNode(
	directions: number[],
	nodeMap: Map<string, string[]>
): number {
	let currentNode = 'AAA';
	let directionIndex = 0;
	let steps = 0;

	while (true) {
		steps++;
		const moveTo = directions[directionIndex];
		directionIndex = (directionIndex + 1) % directions.length;
		currentNode = nodeMap.get(currentNode)[moveTo];
		if (currentNode === 'ZZZ') {
			return steps;
		}
	}
}

function processInstructions(directions: string): number[] {
	return directions.split('').map(direction => (direction === 'L' ? 0 : 1));
}

function processNodesLines(nodeLines: string[]): Map<string, string[]> {
	const nodeMap = new Map<string, string[]>();

	for (const line of nodeLines) {
		const [id, directions] = line.split(' = ');
		const values = directions.replace(/[()]/g, '').split(', ');
		nodeMap.set(id, values);
	}

	return nodeMap;
}

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const [instructions, _, ...nodes] = input.split('\n');

	const nodeMap = processNodesLines(nodes);
	const directions = processInstructions(instructions);

	return countStepsToEndNode(directions, nodeMap);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(8);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`Number of steps needed to reach node ZZZ: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
