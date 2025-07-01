export function hilbert(size: number, n: number): { x: number; y: number } {
	// Convert 1D index n to 2D Hilbert curve coordinates
	// size will be snapped upward to the nearest power of 2

	let x = 0;
	let y = 0;
	let t = n;

	// Snap size upward to the nearest power of 2
	let s = 1;
	while (s < size) {
		s *= 2;
	}

	// Now s is the power of 2 grid size we'll use
	let currentSize = 1;
	while (currentSize < s) {
		const rx = 1 & (t / 2);
		const ry = 1 & (t ^ rx);

		if (ry === 0) {
			if (rx === 1) {
				x = currentSize - 1 - x;
				y = currentSize - 1 - y;
			}
			// Swap x and y
			[x, y] = [y, x];
		}

		x += currentSize * rx;
		y += currentSize * ry;
		t = Math.floor(t / 4);
		currentSize *= 2;
	}

	return { x, y };
}
