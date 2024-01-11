import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';
import { PulseCounter, recordPulseCounts } from './helpers.ts';

import { createModules, FlipFlop, Modules } from './modules.ts';

/* ========================================================================== */

function calculatePulsesForCompletedCycles(
	cycle: PulseCounter[],
	numberOfPushes: number
): number {
	const totalPulses = cycle.reduce(
		(total, step) => ({
			high: total.high + step.high,
			low: total.low + step.low
		}),
		{ high: 0, low: 0 }
	);
	const completedCycles = Math.floor(numberOfPushes / cycle.length);

	return totalPulses.high * completedCycles * totalPulses.low * completedCycles;
}

function calculateScoreForRemainingSteps(
	cycle: PulseCounter[],
	numberOfPushes: number
): number {
	const remainingSteps = numberOfPushes % cycle.length;
	const totalPulses: PulseCounter = { high: 0, low: 0 };
	for (let index = 0; index < remainingSteps; index++) {
		totalPulses.high += cycle[index].high;
		totalPulses.low += cycle[index].low;
	}

	return totalPulses.high * totalPulses.low;
}

function calculateScore(cycle: PulseCounter[], numberOfPushes: number): number {
	const scoreForCompletedCycles = calculatePulsesForCompletedCycles(
		cycle,
		numberOfPushes
	);
	const scoreForRemainingSteps = calculateScoreForRemainingSteps(
		cycle,
		numberOfPushes
	);

	return scoreForCompletedCycles + scoreForRemainingSteps;
}

/* -------------------------------------------------------------------------- */

function getFlipFlopModules(modules: Modules): FlipFlop[] {
	return Object.values(modules).filter(
		module => module instanceof FlipFlop
	) as FlipFlop[];
}

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const numberOfPushes = 1000;
	const modules = createModules(input);

	// Get an array with just the FlipFlop modules, we need these to be able to
	// see if a cycle has been completed.
	const flipFlops: FlipFlop[] = getFlipFlopModules(modules);
	// This is the predicate to see if the next step in the cycle should
	// be taken. When the predicate returns false the cycle is complete. In this
	// case we continue until all flipflops are disabled but only as long as the
	// number of steps is less than the number of times we will push the button.
	const predicate = (stepsTaken: number): boolean => {
		return (
			flipFlops.some(flipFlop => flipFlop.enabled) && stepsTaken < numberOfPushes
		);
	};

	const cycle = recordPulseCounts(modules, predicate);
	const score = calculateScore(cycle, numberOfPushes);

	return score;
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(20);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(
	`Result of multiplying the total low and high pulses: ${result.answer}`
);
console.log(`Time taken: ${result.duration}ms`);
