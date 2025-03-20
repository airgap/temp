import { Client } from 'pg';
import { dbConfig } from '@lyku/db-config';
import {
	ArrayColumnModel,
	IntegerColumnModel,
	PostgresColumnModel,
	PostgresRecordModel,
	PostgresTableModel,
	TextColumnModel,
} from 'from-schema';
import { dbConnectionString } from '@lyku/route-helpers';

const client = new Client({
	connectionString: dbConnectionString,
});

async function connect() {
	await client.connect();
}

async function disconnect() {
	await client.end();
}

export const form = async () => {
	await connect();

	try {
		const existingTables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);

		const tableList = Object.entries(dbConfig.tables);
		console.log('tableList', tableList, '/tableList');
		const missingTables = tableList.filter(
			([tableName]) =>
				!existingTables.rows.some((table) => table.table_name === tableName)
		);

		for (const [tableName, table] of missingTables) {
			const { schema } = table;
			console.log(tableName, table, '/table');
			await createTable(tableName, schema);
		}
	} finally {
		await disconnect();
	}
};

async function createTable<T extends PostgresTableModel<PostgresRecordModel>>(
	tableName: string,
	schema: T
) {
	console.log('creating table', tableName, schema, 'tonka');
	const columns =
		'properties' in schema && schema.properties
			? Object.entries(schema.properties)
					.map(([columnName, columnSchema]) => {
						const columnType = mapColumnType(columnName, columnSchema);
						return `"${columnName}" ${columnType}`;
					})
					.join(', ')
			: '';

	const createTableQuery = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns});`;
	console.log(createTableQuery);
	await client.query(createTableQuery); // Execute the create table query
}

export const mapIntegerType = (
	name: string,
	columnSchema: IntegerColumnModel
): string => {
	return 'INTEGER';
};

export const mapTextType = (
	name: string,
	columnSchema: TextColumnModel
): string => {
	console.log('mapping text', name, columnSchema, '/text');
	const constraints: string[] = [];

	if (columnSchema.primaryKey) {
		constraints.push('PRIMARY KEY');
	}
	if (columnSchema.unique) {
		constraints.push('UNIQUE');
	}
	if (columnSchema.generated) {
		constraints.push(
			`GENERATED ALWAYS AS (${columnSchema.generated.as})${
				columnSchema.generated.stored ? ' STORED' : ''
			}`
		);
	}
	if (columnSchema.checks) {
		constraints.push(...columnSchema.checks.map((check) => `CHECK (${check})`));
	}
	if (columnSchema.maxLength) {
		constraints.push(`CHECK (length("${name}") <= ${columnSchema.maxLength})`);
	}
	if (columnSchema.minLength) {
		constraints.push(`CHECK (length("${name}") >= ${columnSchema.minLength})`);
	}
	// if (columnSchema.default !== undefined) {
	//     constraints.push(`DEFAULT '${columnSchema.default}'`);
	// }
	return `TEXT${constraints.length ? ' ' + constraints.join(' ') : ''}`;
};

export const mapArrayType = (
	name: string,
	columnSchema: ArrayColumnModel
): string => {
	const itemType = mapColumnType(name, columnSchema.items);
	const constraints: string[] = [];
	if (columnSchema.minItems !== undefined) {
		constraints.push(
			`CHECK (array_length("${name}", 1) >= ${columnSchema.minItems})`
		);
	}
	if (columnSchema.maxItems !== undefined) {
		constraints.push(
			`CHECK (array_length("${name}", 1) <= ${columnSchema.maxItems})`
		);
	}
	return `${itemType}[]${
		constraints.length ? ' ' + constraints.join(' ') : ''
	}`;
};

function mapColumnType(
	name: string,
	columnSchema: PostgresColumnModel
): string {
	console.log('switching', columnSchema.type);
	switch (columnSchema.type) {
		case 'double precision':
			return 'DOUBLE PRECISION';
		case 'integer':
		case 'int':
			return mapIntegerType(name, columnSchema);
		case 'bigint':
			return 'BIGINT';
		case 'bigserial':
			return 'BIGSERIAL';
		case 'boolean':
			return 'BOOLEAN';
		case 'char':
		case 'character':
		case 'bpchar':
			return 'CHAR';
		case 'text':
			return mapTextType(name, columnSchema);
		case 'varchar':
		case 'character varying':
			return `VARCHAR(${columnSchema.maxLength})`;
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

form();
