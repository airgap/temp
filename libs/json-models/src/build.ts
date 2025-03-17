import { mkdir } from 'fs/promises';
import path from 'path';
import {
	postgresRecordToTson,
	tsonToType,
	PostgresRecordModel,
	postgresColumnToTson,
	postgresRecordToKysely,
	postgresColumnToKysely,
	stringifyBON,
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
	'timestamptz',
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
				? postgresRecordToTson(value as any, false)
				: value;
		// console.log('Typing', tsonSchema);
		const resolvedTypeString = tsonToType(tsonSchema as any);
		exports.push(`export const ${key} = ${stringifyBON(tsonSchema)};`);

		dtsExports.push(
			`export declare const ${key}: ${stringifyBON(tsonSchema)};\n` +
				`export type ${
					key[0].toUpperCase() + key.slice(1)
				} = ${resolvedTypeString};`,
		);

		if (hasProperties) {
			const insertableTsonSchema = postgresRecordToTson(value as any, true);
			// console.log('Typing', tsonSchema);
			const resolvedInsertableTypeString = tsonToType(
				insertableTsonSchema as any,
			);

			// exports.push(`export const ${key} = ${stringifyBON(insertableTsonSchema)};`);

			dtsExports.push(
				// `export declare const ${key}: ${stringifyBON(insertableTsonSchema)};\n` +
				`export type ${
					'Insertable' + key[0].toUpperCase() + key.slice(1)
				} = ${resolvedInsertableTypeString};`,
			);
		}
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
const assets = [
	'package.json',
	'README.md',
	{ file: 'tsconfig.json', tfm: (txt) => txt.replace('../../', '../../../') },
];
// Copy package.json to dist
for (const { file, tfm = (t) => t } of assets.map((a) =>
	typeof a === 'string' ? { file: a } : a,
)) {
	await Bun.write(
		path.join(__dirname, '..', '..', '..', 'dist', 'libs', 'json-models', file),
		tfm(await Bun.file(path.join(__dirname, '..', file)).text()),
	);
}
