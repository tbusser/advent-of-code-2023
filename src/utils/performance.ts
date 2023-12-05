const markStart = 'start';
const measureId = 'duration';

/* ========================================================================== */

export async function measure<T = string>(
	method
): Promise<{ answer: T; duration: number }> {
	performance.mark(markStart);
	const answer = await method.call();

	performance.measure(measureId, markStart);

	return {
		answer,
		duration: performance.getEntriesByName(measureId)[0].duration
	};
}
