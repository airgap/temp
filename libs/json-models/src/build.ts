import { mkdir } from 'fs/promises';
import path = require('path');
import { b2j, b2t, BsonSchemaOrPrimitive, FromBsonSchema, j2t } from 'from-schema';
import * as ts from 'typescript';
import * as module from 'bson-models';
import * as prettier from 'prettier';

const jsonify = async () => {
	const exports = [];

	// Create program and get type checker
	const program = ts.createProgram([__filename], {});

	for (const key in module) {
		const value = module[key as keyof typeof module];
		if (
			!(
				'bsonType' in value ||
				'oneOf' in value ||
				'anyOf' in value ||
				'union' in value ||
				'enum' in value
			)
		){console.log(key, 'skipped');
			continue;}

		const jsonSchema = b2j(value as BsonSchemaOrPrimitive);
		const resolvedTypeString = j2t(jsonSchema);
		console.log('Resolved', key);

		exports.push(
			`export const ${key} = ${JSON.stringify(jsonSchema, null, 2)} as const;\n` +
			`export type ${key[0].toUpperCase() + key.slice(1)} = ${resolvedTypeString};`
		);
	}

	if (exports.length > 0) {
		const tsPath = path.join(
			__dirname,
			'..',
			'..',
			'..',
			'dist',
			'libs',
			'json-models',
			'src',
			`index.ts`
		);
		const exportDir = path.dirname(tsPath);
		await mkdir(exportDir, { recursive: true });
		
		const tsContent = exports.join('\n\n');
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
  'dist/libs/json-models/package.json',
  await Bun.file('libs/json-models/package.json').text()
);
