import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

import {
	applyTranslationToSeed,
	areSeedAndTranslationOverlapping,
	createSeed,
	createTranslation,
	SeedRange
} from './seed-range.js';

/* ========================================================================== */

function createSeeds(line: string): SeedRange[] {
	const rangePairs = line.match(/\d+[ ]\d+/g);

	return rangePairs.map(range => {
		const [start, length] = range.split(' ').map(Number);

		return createSeed(start, length);
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

function translateSeeds(seeds: SeedRange[], line: string) {
	resetMovedFlag(seeds);

	const [_, ...translationLines] = line.split('\n');
	for (const translationLine of translationLines) {
		const translation = createTranslation(translationLine);
		for (const seed of seeds) {
			if (seed.moved) {
				continue;
			}

			if (areSeedAndTranslationOverlapping(seed, translation)) {
				const result = applyTranslationToSeed(seed, translation);
				seeds.push(...result.splitRanges);
			}
		}
	}
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
