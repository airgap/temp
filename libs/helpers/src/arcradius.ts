export function arcradius(
	cx: number,
	cy: number,
	radius: number,
	degrees: number,
) {
	const radians = ((degrees - 90) * Math.PI) / 180.0;
	return {
		x: cx + radius * Math.cos(radians),
		y: cy + radius * Math.sin(radians),
	};
}
