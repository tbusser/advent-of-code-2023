import { fetchInputForDay } from '../utils/fetch-input.js';
import { measure } from '../utils/performance.js';
import { RegExpGroups } from '../utils/types.ts';

/* ========================================================================== */

type Part = {
	a: number;
	m: number;
	s: number;
	x: number;
};

type Rule = {
	ratingProp: keyof Part;
	comparisonFn: (a: number, b: number) => boolean;
	comparisonValue: number;
	nextRule: string;
};

/* ========================================================================== */

const acceptedLabel = 'A';
const initialWorkflow = 'in';
const rejectedLabel = 'R';

/* ========================================================================== */

function isSmaller(a: number, b: number): boolean {
	return a < b;
}

function isGreater(a: number, b: number): boolean {
	return a > b;
}

function createWorkFlows(input: string): Map<string, Rule[]> {
	const lines = input.split('\n');
	const workflows = new Map<string, Rule[]>();

	for (const line of lines) {
		const { label, rulesInput } = (
			/(?<label>\w+){(?<rulesInput>.*)}/.exec(line) as RegExpGroups<
				'label' | 'rulesInput'
			>
		).groups;

		const rulesArray = rulesInput.split(',');

		const rules = rulesArray.map<Rule>(rule => {
			const { prop, comparison, value, success, next } = (
				/(?<prop>\w{1})(?<comparison>[<>])(?<value>\d+):(?<success>\w+)|(?<next>\w+)/.exec(
					rule
				) as RegExpGroups<'prop' | 'comparison' | 'value' | 'success' | 'next'>
			).groups;

			return {
				ratingProp: prop as Rule['ratingProp'],
				comparisonFn: comparison === '<' ? isSmaller : isGreater,
				comparisonValue: Number(value),
				nextRule: success || next
			};
		});

		workflows.set(label, rules);
	}

	return workflows;
}

function runWorkflow(rules: Rule[], part: Part): string {
	for (const rule of rules) {
		if (rule.ratingProp === undefined) {
			return rule.nextRule;
		}

		if (rule.comparisonFn(part[rule.ratingProp], rule.comparisonValue)) {
			return rule.nextRule;
		}
	}
}

/* ========================================================================== */

async function findSolution(input: string): Promise<number> {
	const [workflowsInput, partRatings] = input.split('\n\n');

	const workflows = createWorkFlows(workflowsInput);
	const acceptedParts: number[] = [];

	partRatings.split('\n').forEach(partRating => {
		// Change the string so it becomes a valid JSON string.
		const jsonPart = partRating
			.replace(/([amsx])/g, '"$1"') // put quotes around the properties
			.replace(/=/g, ':'); // replace the equal sign with a colon
		// Convert the string to an object.
		const part = JSON.parse(jsonPart) as Part;

		// Set the label of the initial workflow.
		let nextWorkflow: string = initialWorkflow;

		// Keep processing workflows until the part is either accepted
		// or rejected.
		do {
			const workflow = workflows.get(nextWorkflow);
			nextWorkflow = runWorkflow(workflow, part);
		} while (nextWorkflow !== acceptedLabel && nextWorkflow !== rejectedLabel);

		if (nextWorkflow === acceptedLabel) {
			acceptedParts.push(
				Object.values(part).reduce((total, value) => total + value, 0)
			);
		}
	});

	return acceptedParts.reduce((total, part) => total + part, 0);
}

/* ========================================================================== */

// Get the input for the puzzle.
const rawInput = await fetchInputForDay(19);
const result = await measure(() => findSolution(rawInput));

/* -------------------------------------------------------------------------- */

console.log(
	`Sum of all ratings number of all accepted parts: ${result.answer}`
);
console.log(`Time taken: ${result.duration}ms`);
