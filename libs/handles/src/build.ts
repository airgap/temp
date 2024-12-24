import { mkdir } from 'fs/promises';
import path from 'path';
import {
	postgresRecordToTson,
	tsonToType,
	postgresColumnToTson,
	buildValidator,
} from 'from-schema';
import tsconfig from '../../../tsconfig.base.json';
import * as ts from 'typescript';
import * as models from '@lyku/mapi-models';
import { MonolithTypes } from '@lyku/mapi-types';
import * as prettier from 'prettier';
// import { dbConfig } from '@lyku/db-config';

type Handle<I, O, H = (input: I) => O> = (handler: H) => {
	execute: H;
	validate: (input: unknown) => input is I;
};

const jsonify = async () => {
	const handles = [];

	for (const [key, value] of Object.entries(models) as [
		keyof typeof models,
		MonolithTypes[keyof typeof models]
	][]) {
		const request = 'request' in value ? tsonToType(value.request) : 'never';
		const response = 'response' in value ? tsonToType(value.response) : 'void';
		const optional = 'authenticated' in value && value.authenticated ? '' : '?';
		const protocol = 'stream' in value && value.stream ? 'Websocket' : 'Http';
		const context =
			'authenticated' in value && value.authenticated
				? 'SecureContext'
				: 'GuestContext';
		const handle = `export const handle${key[0].toUpperCase()}${key.slice(
			1
		)} = (handler:  (request: ${request}, context: ${context}) => ${response} | Promise<${response}>) => serve${protocol}({
				execute: handler,
				validate: ${'request' in value ? buildValidator(value.request) : () => true}
			});`;
		handles.push(handle);
	}

	if (handles.length > 0) {
		const tmpPath = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'tmp',
			'libs',
			'handles',
			'src',
			`index.ts`
		);
		const tmpDir = path.dirname(tmpPath);
		await mkdir(tmpDir, { recursive: true });
		const preamble = await Bun.file('src/preamble.ts').text();
		const tsContent = `${preamble}
	${handles.join('\n\n')}
	`;
		const formattedTsContent = await prettier.format(tsContent, {
			parser: 'typescript',
			semi: true,
			singleQuote: true,
			tabWidth: 2,
		});

		await Bun.write(tmpPath, formattedTsContent);

		// Build the tmp file to dist using bun
		// const outdir = path.join(__dirname, '..', '..', '..', 'dist', 'libs', 'handles', 'src');
		// console.log(outdir);
		// const result = await Bun.build({
		// 	entrypoints: [tmpPath],
		// 	outdir,
		// 	target: 'bun',
		// 	// minify: true,
		// 	format: 'esm', // Export as ES modules
		// 	external: [], // Bundle all dependencies
		// 	splitting: false, // Disable code splitting for single bundle
		// 	sourcemap: 'external',
		// 	plugins: [
		// 		{
		// 			name: 'path-resolver',
		// 			setup(build) {
		// 				build.onResolve({ filter: /^@lyku\// }, args => {
		// 					const paths = tsconfig.compilerOptions.paths;
		// 					console.log(paths);
		// 					const matchedPath = Object.entries(paths).find(([alias]) =>
		// 						args.path.startsWith(alias.replace('/*', ''))
		// 					);
		// 					if (matchedPath) {
		// 						const [alias, [mapping]] = matchedPath;
		// 						const resolvedPath = args.path.replace(
		// 							alias.replace('/*', ''),
		// 							mapping.replace('/*', '')
		// 						);
		// 						return { path: path.resolve(__dirname, '..', '..', '..', resolvedPath) };
		// 					}
		// 				});
		// 			}
		// 		}
		// 	]
		// });

		// if (!result.success) {
		// 	console.error('Build success?', result.success,':', result.logs);
		// 	throw new Error('Build failed');
		// }

		// for (const output of result.outputs) {
		// 	const outPath = path.join(outdir, path.basename(output.path));
		// 	await Bun.write(outPath, output);
		// 	console.log('Wrote', outPath, output);
		// }
	}
};

jsonify();
// Copy package.json to dist
await Bun.write(
	'../../dist/libs/handles/package.json',
	await Bun.file('package.json').text()
);
