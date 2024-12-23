import { mkdir } from 'fs/promises';
import path from 'path';
import {
	postgresRecordToTson,
	tsonToType,
	PostgresRecordModel,
	postgresColumnToTson,
	postgresRecordToKysely,
	postgresColumnToKysely,
} from 'from-schema';
import * as ts from 'typescript';
import * as module from 'bson-models';
import * as prettier from 'prettier';
// import { dbConfig } from '@lyku/db-config';

const pgColumnTypes = [
	'bigint',
	'bigserial',
	'bit',
	'boolean',
	'box',
	'bytea',
	'char',
	'character',
	'character varying',
	'varchar',
	'cidr',
	'circle',
	'date',
	'decimal',
	'double precision',
	'enum',
	'inet',
	'integer',
	'interval',
	'json',
	'jsonb',
	'line',
	'lseg',
	'macaddr',
	'money',
	'numeric',
	'path',
	'point',
	'polygon',
	'real',
	'smallint',
	'smallserial',
	'serial',
	'text',
	'time',
	'timestamp',
	'timestamp with time zone',
	'timestamp without time zone',
	'time with time zone',
	'time without time zone',
	'tsquery',
	'tsvector',
	'txid_snapshot',
	'uuid',
	'xml',
];
const jsonify = async () => {
	const jsPath = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'dist',
		'libs',
		'json-models',
		'src',
		`index.js`,
	);
	const dtsPath = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'dist',
		'libs',
		'json-models',
		'src',
		`index.d.ts`,
	);
	const exportDir = path.dirname(jsPath);
	await mkdir(exportDir, { recursive: true });
	const exports = [];
	const dtsExports = [];
	const kyselyExports = [];
	const handlerExports = [];
	const clientExports = [];

	// Create program and get type checker
	const program = ts.createProgram([__filename], {});

	for (const key in module) {
		const value = module[key as keyof typeof module];
		const hasType = 'type' in value;
		const hasProperties = 'properties' in value;
		let schema;
		// console.log('Detecting', key, value);
		const tsonSchema = hasType
			? pgColumnTypes.includes(value.type)
				? postgresColumnToTson(value as any)
				: value
			: hasProperties
				? postgresRecordToTson(value as any)
				: value;
		// console.log('Typing', tsonSchema);
		const resolvedTypeString = tsonToType(tsonSchema as any);
		// console.log('Resolved', key);

		exports.push(
			`export const ${key} = ${JSON.stringify(
				tsonSchema,
				(_, value) => {
					if (typeof value === 'bigint') {
						return value.toString() + 'n';
					}
					return value;
				},
				2,
			)};`,
		);

		dtsExports.push(
			`export declare const ${key}: ${JSON.stringify(tsonSchema, (_, value) => {
				if (typeof value === 'bigint') {
					return value.toString() + 'n';
				}
				return value;
			}, 2)};\n` +
			`export type ${key[0].toUpperCase() + key.slice(1)} = ${resolvedTypeString};`
		);
	}

	if (exports.length > 0) {
		const jsContent = exports.join('\n\n');
		const dtsContent = dtsExports.join('\n\n');

		const formattedJsContent = await prettier.format(jsContent, {
			parser: 'babel',
			semi: true,
			singleQuote: true,
			tabWidth: 2,
		});

		const formattedDtsContent = await prettier.format(dtsContent, {
			parser: 'typescript',
			semi: true,
			singleQuote: true,
			tabWidth: 2,
		});

		await Bun.write(jsPath, formattedJsContent);
		await Bun.write(dtsPath, formattedDtsContent);
	}
};

await jsonify();
// Copy package.json to dist
await Bun.write(
	'../../dist/libs/json-models/package.json',
	await Bun.file('package.json').text(),
);
