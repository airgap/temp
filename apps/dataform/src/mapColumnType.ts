import { mapArrayType } from './mapArrayType';

import { mapBigintType } from './mapBigintType';
import { mapIntegerType } from './mapIntegerType';
import { mapVarcharType } from './mapVarcharType';
import { mapTextType } from './mapTextType';
import { PostgresColumnModel } from 'from-schema';

import { mapCharType } from './mapCharType';

export function mapColumnType(
	name: string,
	columnSchema: PostgresColumnModel
): string {
	// console.log('switching', columnSchema.type);
	switch (columnSchema.type) {
		case 'double precision':
			return 'DOUBLE PRECISION';
		case 'integer':
		case 'int':
			return mapIntegerType(name, columnSchema);
		case 'bigint':
			return mapBigintType(name, columnSchema);
		case 'bigserial':
			return 'BIGSERIAL';
		case 'boolean':
			return 'BOOLEAN';
		case 'char':
		case 'character':
		case 'bpchar':
			return mapCharType(name, columnSchema);
		case 'text':
			return mapTextType(name, columnSchema);
		case 'varchar':
		case 'character varying':
			return mapVarcharType(name, columnSchema);
		case 'timestamp':
			return 'TIMESTAMP';
		case 'jsonb':
			return 'JSONB';
		case 'enum':
			return `TEXT CHECK ("${name}" IN (${columnSchema.enum
				.map((e) => `'${e}'`)
				.join(', ')}))`;
		case 'array':
			return mapArrayType(name, columnSchema);
		default:
			throw new Error(`Unsupported column type: ${columnSchema.type}`);
	}
}
