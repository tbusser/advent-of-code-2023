import {
	applyTranslationToSeed,
	areSeedAndTranslationOverlapping,
	createSeed,
	createTranslation
} from './seed-range';

/* ========================================================================== */

describe('seed-range', () => {
	describe('createSeed()', () => {
		test('it should create a seed for the given range.', () => {
			let seed = createSeed(79, 14);
			expect(seed.start).toBe(79);
			expect(seed.end).toBe(92);
			expect(seed.length).toBe(14);

			seed = createSeed(55, 13);
			expect(seed.start).toBe(55);
			expect(seed.end).toBe(67);
			expect(seed.length).toBe(13);
		});
	});

	describe('createTranslation()', () => {
		test('it should create a translation for the given line.', () => {
			const translation = createTranslation('50 98 2');
			expect(translation.destinationStart).toBe(50);
			expect(translation.destinationEnd).toBe(51);
			expect(translation.length).toBe(2);
			expect(translation.sourceStart).toBe(98);
			expect(translation.sourceEnd).toBe(99);
		});
	});

	describe('areSeedAndTranslationOverlapping()', () => {
		test('it should return true for matching start positions.', () => {
			const seed = createSeed(50, 10);
			const smaller = createTranslation('10 50 5');
			const longer = createTranslation('10 50 20');
			const equal = createTranslation('10 50 10');

			expect(areSeedAndTranslationOverlapping(seed, smaller)).toBe(true);
			expect(areSeedAndTranslationOverlapping(seed, longer)).toBe(true);
			expect(areSeedAndTranslationOverlapping(seed, equal)).toBe(true);
		});
		test('it should return true for matching end positions.', () => {
			const seed = createSeed(50, 10);
			const smaller = createTranslation('10 55 5');
			const longer = createTranslation('10 40 20');

			expect(areSeedAndTranslationOverlapping(seed, smaller)).toBe(true);
			expect(areSeedAndTranslationOverlapping(seed, longer)).toBe(true);
		});
		test('it should return true for a translation inside the seed range.', () => {
			const seed = createSeed(50, 20);
			const translation = createTranslation('10 55 10');

			expect(areSeedAndTranslationOverlapping(seed, translation)).toBe(true);
		});
		test('it should return true for a translation enveloping the seed range.', () => {
			const seed = createSeed(50, 20);
			const translation = createTranslation('10 1 100');

			expect(areSeedAndTranslationOverlapping(seed, translation)).toBe(true);
		});
		test('it should return false for a translation outside the seed range.', () => {
			const seed = createSeed(50, 10);
			const before = createTranslation('10 1 10');
			const after = createTranslation('10 70 10');

			expect(areSeedAndTranslationOverlapping(seed, before)).toBe(false);
			expect(areSeedAndTranslationOverlapping(seed, after)).toBe(false);
		});
	});

	describe('applyTranslationToSeed()', () => {
		test('it should move the seed when the translation range matches the seed range.', () => {
			const seed = createSeed(50, 10);
			const translation = createTranslation('10 50 10');

			applyTranslationToSeed(seed, translation);

			expect(seed.start).toBe(10);
			expect(seed.end).toBe(19);
			expect(seed.length).toBe(10);
			expect(seed.moved).toBe(true);
		});
		test('it should move the seed when the translation range envelopes the seed range.', () => {
			const seed = createSeed(50, 10);
			const translation = createTranslation('10 40 100');

			applyTranslationToSeed(seed, translation);

			expect(seed.start).toBe(20);
			expect(seed.end).toBe(29);
			expect(seed.length).toBe(10);
			expect(seed.moved).toBe(true);
		});
		test('it should move the seed and split it when the translation range starts inside the seed range and ends outside the seed range.', () => {
			const seed = createSeed(50, 10);
			const translation = createTranslation('10 55 100');

			const result = applyTranslationToSeed(seed, translation);

			expect(seed.start).toBe(50);
			expect(seed.end).toBe(54);
			expect(seed.length).toBe(5);
			expect(seed.moved).toBe(false);

			const newSeed = result.splitRanges[0];
			expect(newSeed.start).toBe(10);
			expect(newSeed.end).toBe(14);
			expect(newSeed.length).toBe(5);
			expect(newSeed.moved).toBe(true);
		});
		test('it should move the seed and split it when the translation range starts before the seed range and ends inside the seed range.', () => {
			const seed = createSeed(50, 10);
			const translation = createTranslation('10 45 10');

			const result = applyTranslationToSeed(seed, translation);

			expect(seed.start).toBe(55);
			expect(seed.end).toBe(59);
			expect(seed.length).toBe(5);
			expect(seed.moved).toBe(false);

			const newSeed = result.splitRanges[0];
			expect(newSeed.start).toBe(15);
			expect(newSeed.end).toBe(19);
			expect(newSeed.length).toBe(5);
			expect(newSeed.moved).toBe(true);
		});
		test('it should move the seed and split when the translation range falls inside the seed range.', () => {
			const seed = createSeed(50, 20);
			const translation = createTranslation('10 55 10');

			const result = applyTranslationToSeed(seed, translation);

			expect(seed.start).toBe(10);
			expect(seed.end).toBe(19);
			expect(seed.length).toBe(10);
			expect(seed.moved).toBe(true);

			const [beforeSeed, afterSeed] = result.splitRanges;
			expect(beforeSeed.start).toBe(50);
			expect(beforeSeed.end).toBe(54);
			expect(beforeSeed.length).toBe(5);
			expect(beforeSeed.moved).toBe(false);

			expect(afterSeed.start).toBe(65);
			expect(afterSeed.end).toBe(69);
			expect(afterSeed.length).toBe(5);
			expect(afterSeed.moved).toBe(false);
		});
	});
});
