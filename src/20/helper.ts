export type PulseType = 'high' | 'low';

export type Pulse = {
	/**
	 * The IDs of the modules to send a pulse to.
	 */
	destinations: string[];

	/**
	 * The ID of the module from which the pulse originates.
	 */
	source: string;

	/**
	 * What kind of pulse is send, high or low.
	 */
	type: PulseType;
};

/* ========================================================================== */

export class Module {
	constructor(
		readonly destinations: string[],
		readonly name
	) {
		//
	}

	/* ---------------------------------------------------------------------- */

	public processPulse(pulse: PulseType, input: string): Pulse | undefined {
		throw new Error(
			`Implement processPulse in subclass. Pulse ${pulse} received from ${input}.`
		);
	}
}

/* ========================================================================== */

export class BroadCaster extends Module {
	constructor(destinations: string[]) {
		super(destinations, 'broadcaster');
	}

	/* ---------------------------------------------------------------------- */

	public processPulse(): Pulse {
		return {
			destinations: this.destinations,
			type: 'low',
			source: this.name
		};
	}
}

/* ========================================================================== */

export class Conjunction extends Module {
	constructor(destinations: string[], name: string) {
		super(destinations, name);
	}

	/* ---------------------------------------------------------------------- */

	private inputs: Map<string, PulseType> = new Map();

	/* ---------------------------------------------------------------------- */

	public processPulse(pulse: PulseType, input: string): Pulse {
		this.inputs.set(input, pulse);
		const pulseToSend: PulseType = Array.from(this.inputs.values()).some(
			pulse => pulse === 'low'
		)
			? 'high'
			: 'low';

		return {
			destinations: this.destinations,
			type: pulseToSend,
			source: this.name
		};
	}

	public registerInput(input: string) {
		this.inputs.set(input, 'low');
	}
}

/* ========================================================================== */

export class FlipFlop extends Module {
	constructor(destinations: string[], name: string) {
		super(destinations, name);
	}

	/* ---------------------------------------------------------------------- */

	private _enabled: boolean = false;
	public get enabled(): boolean {
		return this._enabled;
	}

	/* ---------------------------------------------------------------------- */

	public processPulse(pulse: PulseType): Pulse | undefined {
		if (pulse === 'high') {
			return;
		}

		this._enabled = !this._enabled;

		return {
			destinations: this.destinations,
			type: this.enabled ? 'high' : 'low',
			source: this.name
		};
	}
}
