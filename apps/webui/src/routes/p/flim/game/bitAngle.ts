export const bitAngle = (
	n: number,
	opts?: { range: number; count: number },
) => {
	const { range = 180, count = 8 } = opts || {};

	return (n / count) * range - range / 2;
};
