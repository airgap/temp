const newObject = (count: number, offset: number) =>
	Object.fromEntries(
		new Array(count).fill(null).map((v, i) => [offset + i, offset + i]),
	);

const COUNT = 400000;
const BATCH = 1000;

// Test 1: Object.assign
let assignStart = performance.now();
for (let j = 0; j < COUNT; j++) {
	const testObjects = newObject(1, j);
	let assignResult = {};
	Object.assign(assignResult, testObjects[0]);
}
let assignEnd = performance.now();

// Test 2: Spread operator
let spreadStart = performance.now();
for (let j = 0; j < COUNT; j++) {
	const testObjects = newObject(1, j);
	let spreadResult: Record<string, number> = {};
	spreadResult = { ...spreadResult, ...testObjects[0] };
}
let spreadEnd = performance.now();

// Test 3: Direct property assignment (for...in)
let forInStart = performance.now();
for (let j = 0; j < COUNT; j++) {
	const testObjects = newObject(1, j);
	let forInResult: Record<string, number> = {};
	for (let key in testObjects[0]) {
		forInResult[key] = testObjects[0][key];
	}
}
let forInEnd = performance.now();

// Test 4: Map construction
let mapStart = performance.now();
for (let j = 0; j < COUNT; j++) {
	const testObjects = newObject(1, j);
	let mapResult = new Map();
	for (let key in testObjects[0]) {
		mapResult.set(key, testObjects[0][key]);
	}
}
let mapEnd = performance.now();

// Test 5: Object.fromEntries
let entriesStart = performance.now();
for (let j = 0; j < COUNT; j++) {
	const testObjects = newObject(1, j);
	let entriesResult = Object.fromEntries(Object.entries(testObjects[0]));
}
let entriesEnd = performance.now();

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
