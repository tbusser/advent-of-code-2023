import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

import {
	convertSeedRangeOverlappingWithMapLine,
	areSeedAndMapLineRangesOverlapping,
	createSeedRange,
	createMapLine,
	SeedRange
} from './seed-range.js';

/* ========================================================================== */

function createSeeds(line: string): SeedRange[] {
	const rangePairs = line.match(/\d+[ ]\d+/g);

	return rangePairs.map(range => {
		const [start, length] = range.split(' ').map(Number);

		return createSeedRange(start, length);
	});
}

function findLowestLocation(seeds: SeedRange[]): number {
	return seeds.reduce(
		(lowest, seed) => (seed.start < lowest ? seed.start : lowest),
		Infinity
	);
}

function resetMovedFlag(seeds: SeedRange[]) {
	seeds.forEach(seed => (seed.moved = false));
}

function processConversionMap(seeds: SeedRange[], line: string) {
	// Reset the moved flag for all seeds at the start of a new map..
	resetMovedFlag(seeds);

	const [mapTitle, ...mapLines] = line.split('\n');
	for (const mapLineSource of mapLines) {
		const mapLine = createMapLine(mapLineSource);

		for (const seed of seeds) {
			// Seeds which have already been moved while processing the current
			// conversion map cannot be moved again.
			if (seed.moved) {
				continue;
			}

			// Check if the seed range is affected by the current map line.
			if (areSeedAndMapLineRangesOverlapping(seed, mapLine)) {
				const result = convertSeedRangeOverlappingWithMapLine(seed, mapLine);
				seeds.push(...result.splitRanges);
			}
		}
	}
}

async function findSolution(input: string): Promise<number> {
	const [seedsLine, ...conversionMaps] = input.split('\n\n');
	const seeds = createSeeds(seedsLine);

	conversionMaps.forEach(conversionMap =>
		processConversionMap(seeds, conversionMap)
	);

	return findLowestLocation(seeds);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(5);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`The lowest location number is: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
