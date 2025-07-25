export const vectorToCoords = (vector: { d: number; a: number }) => ({
	x: vector.d * Math.cos(vector.a),
	y: vector.d * Math.sin(vector.a),
});
