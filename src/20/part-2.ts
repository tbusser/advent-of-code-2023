import { fetchInputForDay } from '../utils/fetch-input.js';
import { calculateLeastCommonMultiple } from '../utils/least-common-multiple.ts';
import { measure } from '../utils/performance.js';

import { recordPulseCounts } from './helpers.ts';
import { createModules, Pulse } from './modules.ts';

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const modules = createModules(input);
	// There is some information the puzzle description leaves out.
	// - There is a single node module feeding the rx module. This module is a
	//   conjunction module which in turn is feed by four other conjunction.
	//   Only when during a single button press all four conjunction modules are
	//   enabled, the rx module will receive a low pulse.
	// - The four conjunctions modules have a fixed pattern in which they send
	//   a high signal. Each module sends a high signal every X pushes. This
	//   means the answer will be the least common multiple of the number of
	//   pushes for each of the four conjunction modules to send a high signal.
	//
	// The nodes feeding the final conjunction module are probably different per
	// puzzle input. After analyzing the puzzle input for my input I found these
	// four modules.
	const sources = { cc: null, jq: null, nx: null, sp: null };

	function spy(pulse: Pulse, numberOfPushes: number): void {
		// When the source is not one of the nodes we're interested in, exit.
		if (sources[pulse.source] === undefined) {
			return;
		}

		// When the source already has a value, or when the pulse being send is
		// a low pulse, exit.
		if (sources[pulse.source] !== null || pulse.type === 'low') {
			return;
		}

		// Remember in which cycle the high pulse was send.
		sources[pulse.source] = numberOfPushes;
	}

	const predicate = (): boolean => {
		// Keep pushing the button until for each module we have determined
		// after how many pushes it sends a high pulse.
		return Object.values(sources).some(value => value === null);
	};

	// For part two we don't actually care about the number of times a low or
	// high pulse is send.
	recordPulseCounts(modules, predicate, spy);

	return calculateLeastCommonMultiple(Object.values(sources));
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(20);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(
	`Fewest number of button pushes to deliver a single low pulse to the rx module: ${result.answer}`
);
console.log(`Time taken: ${result.duration}ms`);
