export type SeedRange = {
	/**
	 * The position of the last seed in the range.
	 */
	end: number;

	/**
	 * The number of seeds in the range.
	 */
	length: number;

	/**
	 * Flag to indicate if the seeds in the range have been moved for the map
	 * which is being processed.
	 */
	moved: boolean;

	/**
	 * The position of the first seed in the range.
	 */
	start: number;
};

export type MapLine = {
	/**
	 * The start position where the seeds in the source range have to be
	 * moved to.
	 */
	destinationStart: number;

	/**
	 * The length of range covered by the map line.
	 */
	length: number;

	/**
	 * The end position of the seeds to convert to the destination position.
	 */
	sourceEnd: number;

	/**
	 * The start position of the seeds to convert to the destination position.
	 */
	sourceStart: number;
};

export type SeedConversionResult = {
	seed: SeedRange;
	splitRanges: SeedRange[];
};

/* ========================================================================== */

/**
 * Converts the seed range from its source position to the destination position
 * as defined by the map line.
 */
function convertSeedRange(seed: SeedRange, translation: MapLine) {
	seed.start =
		translation.destinationStart + Math.abs(translation.sourceStart - seed.start);
	seed.end = seed.start + seed.length - 1;
	seed.moved = true;

	return seed;
}

/**
 * Takes a seed range and splits it into two ranges at the given
 * cutoff position.
 */
function splitSeedRange(
	seedRange: SeedRange,
	cutoffPosition: number,
	keep: 'before' | 'after'
): SeedRange {
	// When keep is 'before' everything up to the cutoff position is kept in the
	// original seed range and everything after the cutoff position is placed in
	// a new seed range.
	if (keep === 'before') {
		const newSeed: SeedRange = {
			start: cutoffPosition,
			end: seedRange.end,
			length: seedRange.end - cutoffPosition + 1,
			moved: false
		};
		seedRange.end = cutoffPosition - 1;
		seedRange.length = seedRange.end - seedRange.start + 1;

		return newSeed;
	} else {
		const newSeed: SeedRange = {
			start: seedRange.start,
			end: cutoffPosition,
			length: cutoffPosition - seedRange.start + 1,
			moved: false
		};

		seedRange.start = cutoffPosition + 1;
		seedRange.length = seedRange.end - seedRange.start + 1;

		return newSeed;
	}
}

/* ========================================================================== */

// eslint-disable-next-line complexity
export function convertSeedRangeOverlappingWithMapLine(
	seedRange: SeedRange,
	mapLine: MapLine
): SeedConversionResult {
	const overlapStart = Math.max(seedRange.start, mapLine.sourceStart);
	const overlapEnd = Math.min(seedRange.end, mapLine.sourceEnd);

	// Check if the conversion range matches the seed range. Either the
	// conversion range was an exact match or the conversion range started and
	// ended outside of the seed range.
	if (overlapStart === seedRange.start && overlapEnd === seedRange.end) {
		// Convert the whole range as-is.
		return {
			seed: convertSeedRange(seedRange, mapLine),
			splitRanges: []
		};
	}

	// Check if the conversion range starts inside the seed range and ends after
	// the end of the seed range.
	if (overlapStart > seedRange.start && overlapEnd === seedRange.end) {
		// The seed positions to move start somewhere inside the range and end
		// with the last seed position in the range. This part of the original
		// range is moved into a new range and the positions for this new range
		// will be converted to the destination positions.
		const newRange = convertSeedRange(
			splitSeedRange(seedRange, overlapStart, 'before'),
			mapLine
		);

		return {
			seed: seedRange,
			splitRanges: [newRange]
		};
	}

	// Check if the conversion range starts before the seed range and ends
	// inside the seed range
	if (overlapStart === seedRange.start && overlapEnd < seedRange.end) {
		const newSeed = convertSeedRange(
			splitSeedRange(seedRange, overlapEnd, 'after'),
			mapLine
		);

		return {
			seed: seedRange,
			splitRanges: [newSeed]
		};
	}

	// We've check all other cases, now there is only one case left. The
	// conversion range starts and ends inside the seed range.
	const beforeSeed = splitSeedRange(seedRange, overlapStart - 1, 'after');
	const afterSeed = splitSeedRange(seedRange, overlapEnd + 1, 'before');
	convertSeedRange(seedRange, mapLine);

	return {
		seed: seedRange,
		splitRanges: [beforeSeed, afterSeed]
	};
}

/**
 * Checks if there is any overlap between the seed range and the
 * conversion range.
 */
export function areSeedAndMapLineRangesOverlapping(
	seed: SeedRange,
	mapLine: MapLine
): boolean {
	return seed.end >= mapLine.sourceStart && seed.start <= mapLine.sourceEnd;
}

/**
 * Creates a map line for a given input.
 */
export function createMapLine(line: string): MapLine {
	const [destination, source, length] = line.split(' ').map(Number);

	return {
		destinationStart: destination,
		length,
		sourceStart: source,
		sourceEnd: source + length - 1
	};
}

/**
 * Creates a seed range for a given start position and length.
 */
export function createSeedRange(start: number, length: number): SeedRange {
	return {
		start,
		end: start + length - 1,
		length,
		moved: false
	};
}
