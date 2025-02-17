import { mkdir, readdir, writeFile } from 'fs/promises';
import path from 'path';
import {
	postgresRecordToJson,
	jsonToType,
	PostgresRecordModel,
} from 'from-schema';
import * as ts from 'typescript';
import * as module from './index';
import * as prettier from 'prettier';

const readdirRecursive = async (dir: string): Promise<string[]> => {
	const dirents = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		dirents.map(async (dirent) => {
			const res = path.resolve(dir, dirent.name);
			return dirent.isDirectory() ? await readdirRecursive(res) : res;
		})
	);
	return files.flat();
};

// const a = null as unknown as FromBsonSchema<typeof module.attachment>;

const jsonify = async () => {
	const jsExports = [];
	const dtsExports = [];

	// Create program and get type checker
	const program = ts.createProgram([__filename], {});

	for (const key in module) {
		const value = module[key as keyof typeof module];
		if (
			!(
				'type' in value ||
				'oneOf' in value ||
				'anyOf' in value ||
				'union' in value ||
				'enum' in value
			)
		) {
			console.log(key, 'skipped');
			continue;
		}

		const jsonSchema = postgresRecordToJson(value as PostgresRecordModel);
		jsExports.push(`exports.${key} = ${JSON.stringify(jsonSchema, null, 2)};`);

		const resolvedTypeString = jsonToType(jsonSchema);
		console.log(resolvedTypeString);
		dtsExports.push(
			`export declare const ${key}: ${JSON.stringify(jsonSchema, null, 2)};\n` +
				`export type ${
					key[0].toUpperCase() + key.slice(1)
				} = ${resolvedTypeString};`
		);
	}

	if (jsExports.length > 0) {
		const jsPath = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'dist',
			'libs',
			'json-models',
			'src',
			`index.js`
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
			`index.d.ts`
		);
		const exportDir = path.dirname(jsPath);
		await mkdir(exportDir, { recursive: true });
		await writeFile(jsPath, jsExports.join('\n\n'));

		const tsContent = `${dtsExports.join('\n\n')}`;
		const formattedTsContent = await prettier.format(tsContent, {
			parser: 'typescript',
			semi: true,
			singleQuote: true,
			tabWidth: 2,
		});

		await writeFile(dtsPath, formattedTsContent);
	}
};

jsonify();
