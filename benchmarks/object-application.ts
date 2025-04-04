const newObject = (count: number, offset: number) =>
	Object.fromEntries(
		new Array(count).fill(null).map((v, i) => [offset + i, offset + i]),
	);

const COUNT = 400000;
const BATCH = 1000;

// Test 1: Object.assign
const assignStart = performance.now();
for (let j = 0; j < COUNT; j++) {
	const testObjects = newObject(1, j);
	const assignResult = {};
	Object.assign(assignResult, testObjects[0]);
}
const assignEnd = performance.now();

// Test 2: Spread operator
const spreadStart = performance.now();
for (let j = 0; j < COUNT; j++) {
	const testObjects = newObject(1, j);
	let spreadResult: Record<string, number> = {};
	spreadResult = { ...spreadResult, ...testObjects[0] };
}
const spreadEnd = performance.now();

// Test 3: Direct property assignment (for...in)
const forInStart = performance.now();
for (let j = 0; j < COUNT; j++) {
	const testObjects = newObject(1, j);
	const forInResult: Record<string, number> = {};
	for (const key in testObjects[0]) {
		forInResult[key] = testObjects[0][key];
	}
}
const forInEnd = performance.now();

// Test 4: Map construction
const mapStart = performance.now();
for (let j = 0; j < COUNT; j++) {
	const testObjects = newObject(1, j);
	const mapResult = new Map();
	for (const key in testObjects[0]) {
		mapResult.set(key, testObjects[0][key]);
	}
}
const mapEnd = performance.now();

// Test 5: Object.fromEntries
const entriesStart = performance.now();
for (let j = 0; j < COUNT; j++) {
	const testObjects = newObject(1, j);
	const entriesResult = Object.fromEntries(Object.entries(testObjects[0]));
}
const entriesEnd = performance.now();

// Log results
console.log('Results for', COUNT, 'iterations:');
console.log('Object.assign:', (assignEnd - assignStart).toFixed(2), 'ms');
console.log('Spread operator:', (spreadEnd - spreadStart).toFixed(2), 'ms');
console.log('For...in loop:', (forInEnd - forInStart).toFixed(2), 'ms');
console.log('Map construction:', (mapEnd - mapStart).toFixed(2), 'ms');
console.log(
	'Object.fromEntries:',
	(entriesEnd - entriesStart).toFixed(2),
	'ms',
);
