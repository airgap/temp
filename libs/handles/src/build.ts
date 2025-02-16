import { mkdir } from 'fs/promises';
import path from 'path';
import {
	postgresRecordToTson,
	tsonToType,
	postgresColumnToTson,
	buildValidator,
	stringifyBON,
} from 'from-schema';
import * as prettier from 'prettier';
import * as models from '@lyku/mapi-models';
import { MonolithTypes } from '@lyku/mapi-types';

type Handle<I, O, H = (input: I) => O> = (handler: H) => {
	execute: H;
	validate: (input: unknown) => input is I;
};

const jsonify = async () => {
	const handles = [];

	let modelImports: string[] = [];
	let typeImports: string[] = ['MonolithTypes'];
	const exports = [] as string[];

	for (const [key, value] of Object.entries(models)) {
		const output = [] as string[];
		exports.push(`export * from './${key}'`);
		output.push(`import { ${key} } from '@lyku/mapi-models';`);
		output.push(`import { MonolithTypes } from '@lyku/mapi-types';`);
		modelImports.push(key);
		const upper = key[0].toUpperCase() + key.slice(1);
		// modelImports.push(upper);
		const request = upper + 'Request';
		const optional = 'authenticated' in value && value.authenticated ? '' : '?';
		const protocol = 'stream' in value && value.stream ? 'Websocket' : 'Http';
		const response =
			protocol === 'Http'
				? 'response' in value
					? key[0].toUpperCase() + key.slice(1) + 'Response'
					: 'void'
				: '() => void';
		const tweakRequest =
			'stream' in value &&
			typeof value.stream === 'object' &&
			'tweakRequest' in value.stream
				? upper + 'TweakRequest'
				: undefined;
		const tweakResponse =
			'stream' in value &&
			typeof value.stream === 'object' &&
			'tweakResponse' in value.stream
				? upper + 'TweakResponse'
				: undefined;
		typeImports.push(request);
		const responseImport = response.endsWith('void') ? '' : `, ${response}`;
		output.push(
			`import type { ${request}${responseImport} } from '@lyku/mapi-types';`,
		);
		if (!response.endsWith('void')) typeImports.push(response);
		if (tweakRequest !== undefined) typeImports.push(tweakRequest);
		if (tweakResponse !== undefined) typeImports.push(tweakResponse);
		const authenticated = 'authenticated' in value && value.authenticated;
		const context =
			protocol === 'Websocket'
				? authenticated
					? `SecureSocketContext<typeof ${key}, MonolithTypes['${key}']>`
					: `MaybeSecureSocketContext<typeof ${key}, MonolithTypes['${key}']>`
				: authenticated
					? `SecureHttpContext<typeof ${key}>`
					: `MaybeSecureHttpContext<typeof ${key}>`;
		output.push(
			`import type {${context.split('<')[0]}} from '@lyku/route-helpers';`,
		);
		const validator =
			'request' in value
				? (() => {
						const validator = buildValidator('request', value.request);
						return `{ "validate": (request: unknown): string[] => {const allErrors = []; ${validator.validate.toString()}; return allErrors; }, "validateOrThrow": (request: unknown): void => {${validator.validateOrThrow.toString()}}, "isValid": (request: unknown): string | true => {${validator.isValid.toString()}; return true as const } }`;
					})()
				: '{ validate: (): string[] => [], validateOrThrow: (): void => {}, isValid: (): true => true as const }';
		// console.log('validator', validator);
		const tweakValidator =
			'stream' in value &&
			typeof value.stream === 'object' &&
			'tweakRequest' in value.stream
				? `tweakValidator: ${(() => {
						const validator = buildValidator(
							'tweakRequest',
							value.stream.tweakRequest,
						);
						return `{ "validate": (tweakRequest: unknown): string[] => {const allErrors = []; ${validator.validate.toString()}; return allErrors; }, "validateOrThrow": (tweakRequest: unknown): void => {${validator.validateOrThrow.toString()}}, "isValid": (tweakRequest: unknown): string | true => {${validator.isValid.toString()}; return true as const } },`;
					})()}`
				: '';
		const handle = `export const handle${key[0].toUpperCase()}${key.slice(
			1,
		)} = (handler:  (request: ${request}, context: ${context}) => ${response} | Promise<${response}>) => ({
				${protocol === 'Websocket' ? 'onOpen' : 'execute'}: handler,
				validator: ${validator},
				${tweakValidator}
				model: ${stringifyBON(value)}
			} as const);`;
		if (handle.includes('isObject'))
			output.push(`import { isObject } from 'from-schema';`);
		output.push(handle);
		await Bun.write(
			path.join(
				__dirname,
				'..',
				'..',
				'..',
				'dist',
				'libs',
				'handles',
				'src',
				`${key}.ts`,
			),
			output.join('\n'),
		);
		handles.push(handle);
	}

	if (handles.length > 0) {
		const tmpPath = path.join(
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
		const tmpDir = path.dirname(tmpPath);
		await mkdir(tmpDir, { recursive: true });
		const preamble = await Bun.file('src/preamble.ts').text();
		const tsContent = `${preamble}
		import { ${modelImports.join(', ')} } from '@lyku/mapi-models';
		import { ${typeImports.join(', ')} } from '@lyku/mapi-types';
	${handles.join('\n\n')}
	`;
		const formattedTsContent = await prettier.format(exports.join('\n'), {
			parser: 'typescript',
			semi: true,
			singleQuote: true,
			tabWidth: 2,
		});

		await Bun.write(tmpPath, formattedTsContent);
	}
};

jsonify();
// Copy package.json to dist
await Bun.write(
	'../../dist/libs/handles/package.json',
	await Bun.file('package.json').text(),
);
