import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';

import {
	BroadCaster,
	Conjunction,
	FlipFlop,
	Module,
	PulseType,
	Pulse
} from './helper.js';

/* ========================================================================== */

type Modules = Record<string, Module>;
type PulseCounter = {
	[key in PulseType]: number;
};

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

function createModule(config: string): Module {
	const [name, destination] = config.split(' -> ');
	const destinations = destination.split(', ');
	const cleanName = name.substring(1);

	if (name.startsWith('%')) {
		return new FlipFlop(destinations, cleanName);
	} else if (name.startsWith('&')) {
		return new Conjunction(destinations, cleanName);
	}

	return new BroadCaster(destinations);
}

function createModules(input: string): Modules {
	const result: Record<string, Module> = {};
	const lines = input.split('\n');

	// Create a module for each line from the input and store it in the
	// result object.
	lines.forEach(line => {
		const module = createModule(line);
		result[module.name] = module;
	});

	// Iterate over all the modules. For each module check if one of its
	// destinations is a conjunction module. For each conjunction destination
	// register the module as an input.
	Object.values(result).forEach(module => {
		for (const destination of module.destinations) {
			if (result[destination] instanceof Conjunction) {
				(result[destination] as Conjunction).registerInput(module.name);
			}
		}
	});

	return result;
}

/* -------------------------------------------------------------------------- */

function findCycle(modules: Modules, maxSteps: number = 1000): PulseCounter[] {
	// Per step in the cycle the number of low and high pulses sent.
	const steps: PulseCounter[] = [];
	// Just the FlipFlop modules.
	const flipFlops: FlipFlop[] = getFlipFlopModules(modules);

	// Keep pushing the button until all flip flops are switched off or until
	// the maximum number of steps have been taken.
	do {
		steps.push(pushButton(modules));
	} while (flipFlops.some(module => module.enabled) && steps.length < maxSteps);

	return steps;
}

function getFlipFlopModules(modules: Modules): FlipFlop[] {
	return Object.values(modules).filter(
		module => module instanceof FlipFlop
	) as FlipFlop[];
}

function pushButton(modules: Modules): PulseCounter {
	const queue: Pulse[] = [
		{
			destinations: ['broadcaster'],
			type: 'low',
			source: 'button'
		}
	];
	const pulseCount: PulseCounter = {
		high: 0,
		low: 0
	};

	while (queue.length !== 0) {
		const pulse = queue.shift() as Pulse;

		for (const destination of pulse.destinations) {
			pulseCount[pulse.type]++;
			// console.log(`${pulse.source} -${pulse.type}-> ${destination}`);

			const module = modules[destination];
			const newPulse = module?.processPulse(pulse.type, pulse.source);
			if (newPulse !== undefined) {
				queue.push(newPulse);
			}
		}
	}

	return pulseCount;
}

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const numberOfPushes = 1000;
	const modules = createModules(input);
	const cycle = findCycle(modules, numberOfPushes);
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
