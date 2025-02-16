import { writeFileSync } from 'fs';
import { globSync } from 'glob';

// Count components
const componentFiles = globSync('libs/ui-bits/src/**/*.tsx', {
	ignore: ['libs/ui-bits/src/**/*.spec.tsx'],
});
// Count revisions
const result = Bun.spawn(['git', 'rev-list', '--count', '--all'], {
	stdout: 'pipe',
});

// Read the stdout stream as text
const revisionCount = await new Response(result.stdout).text();

// Count cloc
// Configure cloc options
// Run cloc analysis
const clocResult = Bun.spawn(
	[
		'bunx',
		'cloc',
		'--exclude-list=cloc-exclude',
		'--not-match-f=package-lock.json',
		'--vcs',
		'git',
		'--json',
		'.',
	],
	{
		stdout: 'pipe',
	},
);

const clocOutput = await new Response(clocResult.stdout).text();
const out = {
	components: componentFiles.length,
	revisions: parseInt(revisionCount.trim(), 10),
	cloc: clocOutput,
	pipe: process.env.REACT_APP_PIPE || '420',
};
const ts = Object.entries(out)
	.map(([k, v]) => `export const ${k} = ${v};`)
	.join('\n');
await Bun.write('../../dist/libs/stats/index.ts', ts);

// Do the Bun build (includes declaration generation)
// await Bun.build({
// 	entrypoints: ['../../tmp/libs/stats/index.ts'],
// 	outdir: '../../dist/libs/stats',
// 	target: 'node',
// 	format: 'esm',
// 	splitting: false,
// 	sourcemap: 'external',
// });

await Bun.write(
	'../../dist/libs/stats/package.json',
	await Bun.file('package.json').text(),
);
