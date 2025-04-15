const count = 5_00_000;
const sampleSize = 500;

// Core methods
function dedupeSetSpread(arr: bigint[]): bigint[] {
	return [...new Set(arr)];
}

function dedupeCustom(arr: bigint[]): bigint[] {
	const seen = new Set<bigint>();
	const out: bigint[] = [];
	for (let i = 0; i < arr.length; i++) {
		const val = arr[i];
		if (!seen.has(val)) {
			seen.add(val);
			out.push(val);
		}
	}
	return out;
}

function dedupeSorted(arr: bigint[]): bigint[] {
	if (arr.length === 0) return [];
	const out: bigint[] = [arr[0]];
	for (let i = 1; i < arr.length; i++) {
		if (arr[i] !== arr[i - 1]) out.push(arr[i]);
	}
	return out;
}

function dedupeWithSortAsc(arr: bigint[]): bigint[] {
	if (arr.length === 0) return [];
	const sorted = [...arr].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
	return dedupeSorted(sorted);
}

function dedupeWithSortDesc(arr: bigint[]): bigint[] {
	if (arr.length === 0) return [];
	const sorted = [...arr].sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
	return dedupeSorted(sorted);
}

function dedupeHybrid(
	arr: bigint[],
	sort: 'asc' | 'desc' | 'none' = 'none',
): bigint[] {
	if (sort === 'asc')
		return dedupeSorted([...arr].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0)));
	if (sort === 'desc')
		return dedupeSorted([...arr].sort((a, b) => (a > b ? -1 : a < b ? 1 : 0)));
	return dedupeCustom(arr);
}

// Benchmark harness
function now() {
	return Number(process.hrtime.bigint()) / 1e6; // ms
}

function generateAbstract(count = sampleSize, dupChance = 0.3): bigint[] {
	const result: bigint[] = [];
	const seen: bigint[] = [];
	for (let i = 0; i < count; i++) {
		if (Math.random() < dupChance && seen.length) {
			result.push(seen[Math.floor(Math.random() * seen.length)]);
		} else {
			const val = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
			result.push(val);
			seen.push(val);
		}
	}
	return result;
}

const abstract = generateAbstract();
const sortedAsc = [...abstract].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
const sortedDesc = [...abstract].sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));

function runBench(fn: (arr: bigint[]) => unknown, arr: bigint[]): number[] {
	const times: number[] = [];
	for (let i = 0; i < count; i++) {
		const t0 = now();
		fn(arr);
		const t1 = now();
		times.push(t1 - t0);
	}
	return times;
}
function summarize(label: string, times: number[]) {
	let min = Infinity;
	let max = -Infinity;
	let sum = 0;
	for (let i = 0; i < times.length; i++) {
		const t = times[i];
		if (t < min) min = t;
		if (t > max) max = t;
		sum += t;
	}
	const mean = sum / times.length;
	console.log(
		`${label.padEnd(35)} → min: ${min.toFixed(3)}ms | max: ${max.toFixed(3)}ms | mean: ${mean.toFixed(3)}ms`,
	);
}

// Run suite
console.log(
	`\n=== DEDUPE BENCHMARKS (${count} runs, ~${sampleSize} items) ===\n`,
);

summarize('Set Spread (abstract)', runBench(dedupeSetSpread, abstract));
summarize('Custom Loop (abstract)', runBench(dedupeCustom, abstract));
summarize('Custom Loop (sorted asc)', runBench(dedupeCustom, sortedAsc));
summarize('Sorted Optimized (asc)', runBench(dedupeSorted, sortedAsc));
summarize('Sorted Optimized (desc)', runBench(dedupeSorted, sortedDesc));
summarize('With Sort (asc)', runBench(dedupeWithSortAsc, abstract));
summarize('With Sort (desc)', runBench(dedupeWithSortDesc, abstract));
summarize(
	'Hybrid Mode (asc)',
	runBench((arr) => dedupeHybrid(arr, 'asc'), abstract),
);
summarize(
	'Hybrid Mode (desc)',
	runBench((arr) => dedupeHybrid(arr, 'desc'), abstract),
);
summarize(
	'Hybrid Mode (none)',
	runBench((arr) => dedupeHybrid(arr, 'none'), abstract),
);
