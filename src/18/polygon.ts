import { Coordinate } from '../utils/Grid.ts';

/* ========================================================================== */

export function calculateArea(coordinates: Coordinate[]): number {
	let area = 0;

	for (let index = 0; index < coordinates.length; index++) {
		const pointA = coordinates[index];
		const pointB = coordinates[(index + 1) % coordinates.length];

		area += pointA.x * pointB.y - pointA.y * pointB.x;
	}

	return Math.abs(area) / 2;
}

export function calculatePerimeter(coordinates: Coordinate[]): number {
	let totalLength = 0;

	for (let i = 0; i <= coordinates.length - 1; i++) {
		const a = coordinates[i];
		const b = coordinates[(i + 1) % coordinates.length];

		totalLength += Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	}

	return totalLength;
}
