import { Vector } from './Vector';

export const sumVectors = (v1: Vector, v2: Vector): Vector => {
	// Convert polar coordinates to Cartesian coordinates
	const x1 = v1.magnitude * Math.cos(v1.angle);
	const y1 = v1.magnitude * Math.sin(v1.angle);

	const x2 = v2.magnitude * Math.cos(v2.angle);
	const y2 = v2.magnitude * Math.sin(v2.angle);

	// Sum the Cartesian coordinates
	const xSum = x1 + x2;
	const ySum = y1 + y2;

	// Convert back to polar coordinates
	const magnitudeSum = Math.sqrt(xSum * xSum + ySum * ySum);
	const angleSum = Math.atan2(ySum, xSum);

	return { angle: angleSum, magnitude: magnitudeSum };
};
