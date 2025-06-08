import { hilbert } from './hilbert';

describe('hilbert', () => {
	describe('basic functionality', () => {
		it('should return origin (0,0) for index 0', () => {
			const result = hilbert(4, 0);
			expect(result).toEqual({ x: 0, y: 0 });
		});

		it('should handle first few points of 2x2 grid correctly', () => {
			expect(hilbert(2, 0)).toEqual({ x: 0, y: 0 });
			expect(hilbert(2, 1)).toEqual({ x: 0, y: 1 });
			expect(hilbert(2, 2)).toEqual({ x: 1, y: 1 });
			expect(hilbert(2, 3)).toEqual({ x: 1, y: 0 });
		});

		it('should handle first few points of 4x4 grid correctly', () => {
			// First quadrant
			expect(hilbert(4, 0)).toEqual({ x: 0, y: 0 });
			expect(hilbert(4, 1)).toEqual({ x: 1, y: 0 });
			expect(hilbert(4, 2)).toEqual({ x: 1, y: 1 });
			expect(hilbert(4, 3)).toEqual({ x: 0, y: 1 });
			
			// Second quadrant
			expect(hilbert(4, 4)).toEqual({ x: 0, y: 2 });
			expect(hilbert(4, 5)).toEqual({ x: 0, y: 3 });
			expect(hilbert(4, 6)).toEqual({ x: 1, y: 3 });
			expect(hilbert(4, 7)).toEqual({ x: 1, y: 2 });
		});
	});

	describe('powers of 2 grids', () => {
		it('should handle 8x8 grid', () => {
			const result = hilbert(8, 0);
			expect(result).toEqual({ x: 0, y: 0 });

			// Test a few more points
			const result2 = hilbert(8, 15);
			expect(result2.x).toBeGreaterThanOrEqual(0);
			expect(result2.x).toBeLessThan(8);
			expect(result2.y).toBeGreaterThanOrEqual(0);
			expect(result2.y).toBeLessThan(8);
		});

		it('should handle 16x16 grid', () => {
			const result = hilbert(16, 0);
			expect(result).toEqual({ x: 0, y: 0 });

			// Test boundary
			const result2 = hilbert(16, 255);
			expect(result2.x).toBeGreaterThanOrEqual(0);
			expect(result2.x).toBeLessThan(16);
			expect(result2.y).toBeGreaterThanOrEqual(0);
			expect(result2.y).toBeLessThan(16);
		});

		it('should handle 32x32 grid', () => {
			const result = hilbert(32, 100);
			expect(result.x).toBeGreaterThanOrEqual(0);
			expect(result.x).toBeLessThan(32);
			expect(result.y).toBeGreaterThanOrEqual(0);
			expect(result.y).toBeLessThan(32);
		});
	});

	describe('power-of-2 snapping', () => {
		it('should snap size 10 up to 16', () => {
			const result = hilbert(10, 10);
			expect(result.x).toBeGreaterThanOrEqual(0);
			expect(result.x).toBeLessThan(16); // Snaps to 16
			expect(result.y).toBeGreaterThanOrEqual(0);
			expect(result.y).toBeLessThan(16);
		});

		it('should handle size 5 (snaps to 8)', () => {
			const result = hilbert(5, 10);
			expect(result.x).toBeGreaterThanOrEqual(0);
			expect(result.x).toBeLessThan(8); // Snaps to 8
			expect(result.y).toBeGreaterThanOrEqual(0);
			expect(result.y).toBeLessThan(8);
		});
	});

	describe('edge cases', () => {
		it('should handle 1x1 grid', () => {
			const result = hilbert(1, 0);
			expect(result).toEqual({ x: 0, y: 0 });
		});

		it('should handle large indices', () => {
			const result = hilbert(256, 65535);
			expect(result.x).toBeGreaterThanOrEqual(0);
			expect(result.x).toBeLessThan(256);
			expect(result.y).toBeGreaterThanOrEqual(0);
			expect(result.y).toBeLessThan(256);
		});

		it('should handle very large grids', () => {
			const result = hilbert(1024, 1000);
			expect(result.x).toBeGreaterThanOrEqual(0);
			expect(result.x).toBeLessThan(1024);
			expect(result.y).toBeGreaterThanOrEqual(0);
			expect(result.y).toBeLessThan(1024);
		});
	});

	describe('mathematical properties', () => {
		it('should produce unique coordinates for sequential indices', () => {
			const seen = new Set<string>();
			const gridSize = 4;
			
			for (let i = 0; i < gridSize * gridSize; i++) {
				const { x, y } = hilbert(gridSize, i);
				const key = `${x},${y}`;
				expect(seen.has(key)).toBe(false);
				seen.add(key);
			}
		});

		it('should maintain locality - adjacent indices should be spatially close', () => {
			const gridSize = 8;
			let totalDistance = 0;
			let count = 0;

			for (let i = 0; i < gridSize * gridSize - 1; i++) {
				const curr = hilbert(gridSize, i);
				const next = hilbert(gridSize, i + 1);
				
				// Manhattan distance between consecutive points
				const distance = Math.abs(curr.x - next.x) + Math.abs(curr.y - next.y);
				
				// Adjacent points in Hilbert curve should be neighbors (distance = 1)
				expect(distance).toBe(1);
				
				totalDistance += distance;
				count++;
			}

			// Average distance should be exactly 1 for perfect Hilbert curve
			expect(totalDistance / count).toBe(1);
		});

		it('should fill space without gaps for complete traversal', () => {
			const gridSize = 4;
			const visited = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));

			for (let i = 0; i < gridSize * gridSize; i++) {
				const { x, y } = hilbert(gridSize, i);
				visited[y][x] = true;
			}

			// Check that all cells were visited
			for (let y = 0; y < gridSize; y++) {
				for (let x = 0; x < gridSize; x++) {
					expect(visited[y][x]).toBe(true);
				}
			}
		});
	});

	describe('bit manipulation correctness', () => {
		it('should correctly extract rx and ry bits', () => {
			// Test the bit manipulation logic indirectly through known values
			const testCases = [
				{ n: 0, expected: { x: 0, y: 0 } },
				{ n: 1, expected: { x: 0, y: 1 } },
				{ n: 2, expected: { x: 1, y: 1 } },
				{ n: 3, expected: { x: 1, y: 0 } },
			];

			testCases.forEach(({ n, expected }) => {
				const result = hilbert(2, n);
				expect(result).toEqual(expected);
			});
		});
	});

	describe('performance characteristics', () => {
		it('should handle large numbers of calls efficiently', () => {
			const start = Date.now();
			const iterations = 10000;
			
			for (let i = 0; i < iterations; i++) {
				hilbert(256, i % (256 * 256));
			}
			
			const elapsed = Date.now() - start;
			// Should complete 10k iterations in under 100ms
			expect(elapsed).toBeLessThan(100);
		});
	});

	describe('regression tests', () => {
		it('should produce consistent results for known patterns', () => {
			// 4x4 grid full traversal
			const expected4x4 = [
				{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 },
				{ x: 0, y: 2 }, { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 2 },
				{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 3, y: 2 },
				{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 0 }, { x: 3, y: 0 }
			];

			expected4x4.forEach((expected, index) => {
				const result = hilbert(4, index);
				expect(result).toEqual(expected);
			});
		});
	});

	describe('invalid inputs', () => {
		it('should handle negative indices gracefully', () => {
			const result = hilbert(4, -1);
			// Should still return valid coordinates
			expect(result.x).toBeDefined();
			expect(result.y).toBeDefined();
		});

		it('should handle decimal indices by flooring', () => {
			const result1 = hilbert(4, 2.7);
			const result2 = hilbert(4, 2);
			expect(result1).toEqual(result2);
		});

		it('should handle zero dimensions', () => {
			const result = hilbert(0, 0);
			expect(result).toEqual({ x: 0, y: 0 });
		});
	});
});