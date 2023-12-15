import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

type Lense = {
	label: string;
	focalLength: number;
};

/* ========================================================================== */

function hashSequence(sequence: string): number {
	let currentValue = 0;

	for (let index = 0; index < sequence.length; index++) {
		const characterValue = sequence.charCodeAt(index);
		currentValue = ((currentValue + characterValue) * 17) % 256;
	}

	return currentValue;
}

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const sequences = input.split(',');
	const boxes: Map<number, Lense[]> = new Map();

	sequences.forEach(sequence => {
		const [label, focalLength] = sequence.split(/[=-]/);
		const box = hashSequence(label);

		if (!boxes.has(box)) {
			boxes.set(box, []);
		}

		if (focalLength === '') {
			// Remove the lense with the current label
			const lenses = boxes.get(box);
			boxes.set(
				box,
				lenses.filter(lens => lens.label !== label)
			);
		} else {
			const lenses = boxes.get(box);
			// Find the lense in the box
			const lens = lenses.find(lens => lens.label === label);
			if (lens === undefined) {
				// Lense was not present in the box, add it.
				lenses.push({ label, focalLength: Number(focalLength) });
			} else {
				// Replace the focal length of the lense.
				lens.focalLength = Number(focalLength);
			}
		}
	});

	let result = 0;
	// Iterate over all the boxes and calculate the grand total.
	boxes.forEach((lenses, box) => {
		result += lenses.reduce((total, lens, index) => {
			return total + (box + 1) * (index + 1) * lens.focalLength;
		}, 0);
	});

	return result;
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(15);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(`The focusing power of the lens configuration: ${result.answer}`);
console.log(`Time taken: ${result.duration}ms`);
