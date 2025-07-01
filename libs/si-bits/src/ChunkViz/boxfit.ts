export function boxfit(n: number): { x: number; y: number } {
	if (n <= 0) {
		return { x: 0, y: 0 };
	}

	if (n === 1) {
		return { x: 1, y: 1 };
	}

	// Find the dimensions that minimize the aspect ratio
	// Start from the square root and work outward
	const sqrt = Math.sqrt(n);
	let bestX = 1;
	let bestY = n;
	let bestRatio = Math.max(bestX, bestY) / Math.min(bestX, bestY);

	// Check all possible factorizations
	for (let x = 1; x <= sqrt; x++) {
		if (n % x === 0) {
			const y = n / x;
			const ratio = Math.max(x, y) / Math.min(x, y);

			if (ratio < bestRatio) {
				bestRatio = ratio;
				bestX = x;
				bestY = y;
			}
		}
	}

	// Return with x <= y convention (width <= height)
	if (bestX > bestY) {
		[bestX, bestY] = [bestY, bestX];
	}

	return { x: bestX, y: bestY };
}
