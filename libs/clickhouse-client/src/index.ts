import {
	createClient,
	ClickHouseClientConfigOptions,
} from '@clickhouse/client';

const url = process.env['CH_ENDPOINT'];
const password = process.env['CH_PASSWORD'];
const username = process.env['CH_USERNAME'];
console.log(url, username, password);
export const createClickhouseClient = (
	options: ClickHouseClientConfigOptions = {},
) =>
	createClient({
		request_timeout: 10_000,
		url,
		// password,
		// username,
		...options,
	});
export const client = createClickhouseClient();
