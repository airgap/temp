export function dedupe<T>(arr: T[]): T[] {
	const seen = new Set<T>();
	const out: T[] = [];
	for (let i = 0; i < arr.length; i++) {
		const val = arr[i];
		if (!seen.has(val)) {
			seen.add(val);
			out.push(val);
		}
	}
	return out;
}
