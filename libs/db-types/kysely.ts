import prettier from 'prettier';
import { dbConfig } from '@lyku/db-config';
import { postgresRecordToKysely } from 'from-schema';
import { join } from 'path';

const kyselyExports: [string, any][] = [];
for (const [key, value] of Object.entries(dbConfig.tables)) {
	const kyselySchema = postgresRecordToKysely(value.schema);
	kyselyExports.push([key, kyselySchema]);
}
const kimports = `import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from 'kysely'
`;
const ktypes = kyselyExports
	.map(
		([k, v]) =>
			`export type ${k[0].toLocaleUpperCase()}${k.substring(1)} = ${v}`,
	)
	.join('\n');
const ktsContent = `${kimports}\n${ktypes}\nexport type Database = {\n${kyselyExports
	.map(([k, v]) => `${k}:${k[0].toLocaleUpperCase()}${k.slice(1)}`)
	.join(',\n')}\n}`;
const formattedKtsContent = await prettier.format(ktsContent, {
	parser: 'typescript',
	semi: true,
	singleQuote: true,
	tabWidth: 2,
});
const ktsPath = join(
	__dirname,
	'..',
	'..',
	'dist',
	'libs',
	'db-types',
	`kysely.d.ts`,
);
await Bun.write(ktsPath, formattedKtsContent);
