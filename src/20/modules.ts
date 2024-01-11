export type Modules = Record<string, Module>;

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

	private _pulseToSend: PulseType = 'high';
	public get lastPulseType(): PulseType {
		return this._pulseToSend;
	}
	private inputs: Map<string, PulseType> = new Map();

	/* ---------------------------------------------------------------------- */

	public processPulse(pulse: PulseType, input: string): Pulse {
		this.inputs.set(input, pulse);
		this._pulseToSend = Array.from(this.inputs.values()).some(
			pulse => pulse === 'low'
		)
			? 'high'
			: 'low';

		return {
			destinations: this.destinations,
			type: this._pulseToSend,
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

/* ========================================================================== */

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
	const result: Modules = {};
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

/* ========================================================================== */

export { createModules };
