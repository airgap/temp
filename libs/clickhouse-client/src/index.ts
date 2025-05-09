import {
	createClient,
	ClickHouseClientConfigOptions,
} from '@clickhouse/client';

const url = process.env['CH_ENDPOINT'];
const password = process.env['CH_PASSWORD'];
const username = process.env['CH_USERNAME'];

export const createClickhouseClient = (
	options: ClickHouseClientConfigOptions = {},
) =>
	createClient({
		url,
		password,
		username,
		...options,
	});
export const client = createClickhouseClient();
