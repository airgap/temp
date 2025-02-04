import { Point2D } from './Point2D';

export const averagePoints = (
	point1: Point2D,
	point2: Point2D,
	weight: number
) => ({
	x: point1.x * (1 - weight) + point2.x * weight,
	y: point1.y * (1 - weight) + point2.y * weight,
});
