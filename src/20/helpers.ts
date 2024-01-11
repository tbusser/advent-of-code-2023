import { Modules, PulseType, Pulse } from './modules.ts';

/* ========================================================================== */

type InternalSpy = (pulse: Pulse) => void;

export type PulseCounter = {
	[key in PulseType]: number;
};
type Spy = (pulse: Pulse, numberOfPushes: number) => void;

/* ========================================================================== */

function pushButton(modules: Modules, spy?: InternalSpy): PulseCounter {
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

		spy?.call(this, pulse);

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

/**
 * @param modules The modules that make up the machine.
 * @param predicate A predicate which determines when to stop pushing the
 *        button. The button will keep getting pushed until the predicate
 *        returns false.
 * @param spy A spy method which is called for each pulse that is send. The spy
 *        is called once per sender, not once per destination.
 */
function recordPulseCounts(
	modules: Modules,
	predicate: (numberOfPushes: number) => boolean,
	spy?: Spy
): PulseCounter[] {
	// Per step in the cycle the number of low and high pulses sent.
	const steps: PulseCounter[] = [];
	const pulseSpy = spy
		? (pulse: Pulse) => spy.call(this, pulse, steps.length + 1)
		: undefined;

	// Keep pushing the button until all flip flops are switched off or until
	// the maximum number of steps have been taken.
	do {
		steps.push(pushButton(modules, pulseSpy));
	} while (predicate(steps.length));

	return steps;
}

/* ========================================================================== */

export { recordPulseCounts };
