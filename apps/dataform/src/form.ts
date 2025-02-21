import { Client } from 'pg';
import { dbConfig } from '@lyku/db-config';
import { dbConnectionString } from '@lyku/route-helpers';
import { readFileSync } from 'fs';
import { setupTable } from './setupTable';
// const ca = readFileSync('./k8s-prd-ca-cert.crt', 'utf8');
// const client = new Client({
// 	connectionString: dbConnectionString,
// 	ssl: {
// 		ca,
// 		rejectUnauthorized: false,
// 	},
// });

// async function connect() {
// 	await client.connect();
// }

// async function disconnect() {
// 	await client.end();
// }

export const form = async () => {
	// await connect();

	try {
		// const existingTables = await client.query(`
		//     SELECT table_name
		//     FROM information_schema.tables
		//     WHERE table_schema = 'public';
		// `);

		const tableList = Object.entries(dbConfig.tables);
		// console.log('tableList', tableList, '/tableList');
		// const missingTables = tableList.filter(
		// 	([tableName]) =>
		// 		!existingTables.rows.some((table) => table.table_name === tableName),
		// );

		for (const [tableName, table] of tableList) {
			// console.log(tableName, table, '/table');
			const output = setupTable(tableName, table);
			console.log(output);
		}
	} finally {
		// await disconnect();
	}
};

form();
