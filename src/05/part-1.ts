import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

/* ========================================================================== */

type Seed = {
	seed: number;
	location: number;
	moved: boolean;
};

function createSeeds(line: string): Seed[] {
	const seeds = line
		.match(/[\d ]+$/)[0]
		.trim()
		.split(/\s+/)
		.map(Number);

	return seeds.map(seed => ({
		seed: seed,
		location: seed,
		moved: false
	}));
}

function translateSeeds(seeds: Seed[], line: string) {
	seeds.forEach(seed => (seed.moved = false));

	const [_, ...translations] = line.split('\n');
	for (const translation of translations) {
		const [destination, source, length] = translation.split(' ').map(Number);
		const upperBound = source + length;

		for (const seed of seeds) {
			if (seed.location >= source && seed.location < upperBound && !seed.moved) {
				seed.location = destination + (seed.location - source);
				seed.moved = true;
			}
		}
	}
}

function findLowestLocation(seeds: Seed[]): number {
	return seeds.reduce(
		(lowest, seed) => (seed.location < lowest ? seed.location : lowest),
		Infinity
	);
}

async function findSolution(input: string): Promise<number> {
	const lines = input.split('\n\n');
	const seeds = createSeeds(lines[0]);

	for (let index = 1; index < lines.length; index++) {
		translateSeeds(seeds, lines[index]);
	}

	return findLowestLocation(seeds);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(5);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`The lowest location number is: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
