// benchmark.ts
import { performance } from 'perf_hooks'; // Node.js performance API
import { logBigInt } from './logBigInt';

const benchmark = (base: number, exponent: bigint, iterations: number) => {
	const start = performance.now();
	for (let i = 0; i < iterations; i++) {
		const result = logBigInt(exponent);
		// Optionally log the result for the first iteration
		if (i === 0) {
			console.log(
				`Result: ${result.toString().slice(0, 50)}... (length: ${
					result.toString().length
				})`,
			);
		}
	}
	const end = performance.now();
	console.log(
		`Time taken for ${iterations} iterations: ${(end - start).toFixed(4)} ms`,
	);
};

// Test with a large exponent and run 1,000,000 times
const testExponents = [10n, 100n, 1000n, 10000n]; // Reduced exponent sizes
const iterations = 1000000; // Number of times to run the benchmark

testExponents.forEach((exp) => {
	benchmark(2, exp, iterations);
});
