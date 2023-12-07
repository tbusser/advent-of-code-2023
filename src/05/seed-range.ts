export type SeedRange = {
	end: number;
	length: number;
	moved: boolean;
	start: number;
};

export type Translation = {
	destinationStart: number;
	destinationEnd: number;
	length: number;
	sourceEnd: number;
	sourceStart: number;
};

export type TranslationResult = {
	seed: SeedRange;
	splitRanges: SeedRange[];
};

/* ========================================================================== */

function moveSeed(seed: SeedRange, translation: Translation) {
	seed.start =
		translation.destinationStart + Math.abs(translation.sourceStart - seed.start);
	seed.end = seed.start + seed.length - 1;
	seed.moved = true;

	return seed;
}

function splitSeed(
	seed: SeedRange,
	cutoff: number,
	keep: 'before' | 'after'
): SeedRange {
	if (keep === 'before') {
		const newSeed: SeedRange = {
			start: cutoff,
			end: seed.end,
			length: seed.end - cutoff + 1,
			moved: false
		};
		seed.end = cutoff - 1;
		seed.length = seed.end - seed.start + 1;

		return newSeed;
	} else {
		const newSeed: SeedRange = {
			start: seed.start,
			end: cutoff,
			length: cutoff - seed.start + 1,
			moved: false
		};

		seed.start = cutoff + 1;
		seed.length = seed.end - seed.start + 1;

		return newSeed;
	}
}

/* ========================================================================== */

// eslint-disable-next-line complexity
export function applyTranslationToSeed(
	seed: SeedRange,
	translation: Translation
): TranslationResult {
	const overlapStart = Math.max(seed.start, translation.sourceStart);
	const overlapEnd = Math.min(seed.end, translation.sourceEnd);

	// Check if the translation range matches the seed range.
	if (overlapStart === seed.start && overlapEnd === seed.end) {
		moveSeed(seed, translation);

		return {
			seed,
			splitRanges: []
		};
	}

	// Check if the translation range starts inside the range and ends after
	// of the seed range.
	if (overlapStart > seed.start && overlapEnd === seed.end) {
		return {
			seed,
			splitRanges: [moveSeed(splitSeed(seed, overlapStart, 'before'), translation)]
		};
	}

	// Check if the translation range starts before the seed range and ends
	// inside the seed range
	if (overlapStart === seed.start && overlapEnd < seed.end) {
		const newSeed = moveSeed(splitSeed(seed, overlapEnd, 'after'), translation);

		return {
			seed,
			splitRanges: [newSeed]
		};
	}

	// We've check all other cases, now there is only one case left. The
	// translation range starts and ends inside the seed range.
	const beforeSeed = splitSeed(seed, overlapStart - 1, 'after');
	const afterSeed = splitSeed(seed, overlapEnd + 1, 'before');
	moveSeed(seed, translation);

	return {
		seed,
		splitRanges: [beforeSeed, afterSeed]
	};
}

export function areSeedAndTranslationOverlapping(
	seed: SeedRange,
	translation: Translation
): boolean {
	return (
		seed.end >= translation.sourceStart && seed.start <= translation.sourceEnd
	);
}

export function createSeed(start: number, length: number): SeedRange {
	return {
		start,
		end: start + length - 1,
		length,
		moved: false
	};
}

export function createTranslation(line: string): Translation {
	const [destination, source, length] = line.split(' ').map(Number);

	return {
		destinationStart: destination,
		destinationEnd: destination + length - 1,
		length,
		sourceStart: source,
		sourceEnd: source + length - 1
	};
}
