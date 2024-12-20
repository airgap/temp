import { mkdir } from 'fs/promises';
import path from 'path';
import {
	postgresRecordToTson,
	tsonToType,
	postgresColumnToTson,
	buildValidator,
} from 'from-schema';
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
		MonolithTypes[keyof typeof models],
	][]) {
		const request = 'request' in value ? tsonToType(value.request) : 'never';
		const response = 'response' in value ? tsonToType(value.response) : 'void';
		const optional = 'authenticated' in value && value.authenticated ? '' : '?';
		const context =
			'authenticated' in value && value.authenticated
				? 'SecureContext'
				: 'GuestContext';
		const handle = `export const handle${key[0].toUpperCase()}${key.slice(1)} = (handler:  (request: ${request}, context: ${context}) => ${response} | Promise<${response}>) => ({
				execute: handler,
				validate: ${'request' in value ? buildValidator(value.request) : () => true}
			});`;
		handles.push(handle);
	}

	if (handles.length > 0) {
		const tsPath = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'dist',
			'libs',
			'handles',
			'src',
			`index.ts`,
		);
		const exportDir = path.dirname(tsPath);
		await mkdir(exportDir, { recursive: true });
		const preamble = await Bun.file('libs/handles/src/preamble.ts').text();
		const tsContent = `${preamble}
	${handles.join('\n\n')}
	`;
		const formattedTsContent = await prettier.format(tsContent, {
			parser: 'typescript',
			semi: true,
			singleQuote: true,
			tabWidth: 2,
		});

		await Bun.write(tsPath, formattedTsContent);
	}
};

jsonify();
// Copy package.json to dist
await Bun.write(
	'dist/libs/handles/package.json',
	await Bun.file('libs/handles/package.json').text(),
);
