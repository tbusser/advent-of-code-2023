import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

/* ========================================================================== */

type Ghost = {
	node: string;
	steps: number;
};

/* ========================================================================== */

/**
 * Keep following the directions until we reach node which ends on a 'Z'.
 */
function findPossibleEndNode(
	directions: number[],
	nodeMap: Map<string, string[]>,
	ghost: Ghost
): { node: string; steps: number } {
	let directionIndex = ghost.steps % directions.length;

	while (true) {
		ghost.steps++;
		const moveTo = directions[directionIndex];
		ghost.node = nodeMap.get(ghost.node)[moveTo];
		if (ghost.node.endsWith('Z')) {
			return;
		}

		directionIndex = (directionIndex + 1) % directions.length;
	}
}

function processInstructions(directions: string): number[] {
	return directions.split('').map(direction => (direction === 'L' ? 0 : 1));
}

function processNodesLines(nodeLines: string[]): {
	nodeMap: Map<string, string[]>;
	startNodes: string[];
} {
	const nodeMap = new Map<string, string[]>();
	const startNodes = [];

	for (const line of nodeLines) {
		const [id, directions] = line.split(' = ');
		const values = directions.replace(/[()]/g, '').split(', ');
		nodeMap.set(id, values);
		if (id.endsWith('A')) {
			startNodes.push(id);
		}
	}

	return {
		nodeMap,
		startNodes
	};
}

/**
 * Method to find the prime factors of a number. This method was copied from
 * this StackOverflow answer: https://stackoverflow.com/a/39899363/1244780
 */
function getPrimeFactors(integer): number[] {
	const primeArray = [];
	let isPrime;

	// Find divisors starting with 2
	for (let i = 2; i <= integer; i++) {
		if (integer % i !== 0) {
			continue;
		}

		// Check if the divisor is a prime number
		for (let j = 2; j <= i / 2; j++) {
			isPrime = i % j !== 0;
		}

		if (!isPrime) {
			continue;
		}
		// if the divisor is prime, divide integer with the number and store it in the array
		integer /= i;
		primeArray.push(i);
	}

	return primeArray;
}

function groupNumbers(numbers: number[]): { [key: string]: number } {
	return numbers.reduce((result, number) => {
		result[number] = (result[number] ?? 0) + 1;

		return result;
	}, {});
}

/* ========================================================================== */

/**
 * What the README doesn't mention:
 * - Each ghost will only hit 1 node which ends on a 'Z'
 * - The interval at which the ghost hits this end node is fixed for that ghost.
 */
async function findSolution(input: string): Promise<number> {
	const [instructions, _, ...nodes] = input.split('\n');

	const { nodeMap, startNodes } = processNodesLines(nodes);
	const directions = processInstructions(instructions);

	// Create a ghost for each of the start nodes.
	const ghosts = startNodes.map(node => ({
		node,
		steps: 0
	}));

	// For each ghost find the node which ends on a 'Z'.
	ghosts.forEach(ghost => findPossibleEndNode(directions, nodeMap, ghost));

	// For each ghost we have found the interval at which it will visit its end
	// node. With these intervals we need to find the least common multiple for
	// these numbers.
	// See: https://www.cuemath.com/numbers/lcm-least-common-multiple/

	// 1: Calculate for each ghost's interval what its prime factors are.
	const primeFactorsPerGhost = ghosts.map(ghost => getPrimeFactors(ghost.steps));

	// 2: For each ghost we have to group its prime factors so we know how many
	//    times a prime number occurs in the prime factors for that ghost. The
	//    result is an object where the key is the prime number and the value is
	//    is how many times that prime number occurs in the prime factors. The
	//    will be used as the power of that prime number.
	const groupedPrimeNumbersPerGhost = primeFactorsPerGhost.map(groupNumbers);

	// 3: We need to merge the prime numbers of all ghosts into a single object
	//    where each prime number exists only once and the power of that prime
	//    number is the highest power of that prime number of all ghosts.
	//    E.g.: Ghost 1 has 2 twice in its prime factors and ghost 2 has 2 once
	//          in its prime factors, we only keep the 2 with 2 as its power.
	const highestPowerPrimeNumbers = groupedPrimeNumbersPerGhost.reduce(
		(result, primeNumbers) => {
			// Iterate over all the prime numbers for this ghost.
			Object.keys(primeNumbers).forEach(number => {
				const power = primeNumbers[number];
				// Only save its power when it is more than the current power.
				result[number] = Math.max(result[number] ?? 0, power);
			});

			return result;
		},
		{}
	);

	// 4: Now that we have determined the highest power of each prime number we
	//    can calculate the least common multiple. For this we have to take each
	//    prime number to its highest power and multiply them all together.
	const leastCommonMultiple = Object.keys(highestPowerPrimeNumbers).reduce(
		(result, number) => {
			const power = highestPowerPrimeNumbers[number];

			return result * Math.pow(Number(number), power);
		},
		1
	);

	return leastCommonMultiple;
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(8);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`Number of steps needed to reach node ZZZ: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
