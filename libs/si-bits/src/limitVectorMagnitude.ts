import { Vector } from './Vector';

export const limitVectorMagnitude = (
	vector: Vector,
	magnitude: number
): Vector => ({
	angle: vector.angle,
	magnitude:
		vector.magnitude > magnitude
			? magnitude
			: vector.magnitude < 0.1
			? 0
			: vector.magnitude,
});
