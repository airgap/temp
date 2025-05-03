import { createClient } from '@clickhouse/client';

export const createClickhouseClient = () =>
	createClient({
		url: process.env['CH_ENDPOINT'],
		password: process.env['CH_PASSWORD'],
		username: process.env['CH_USERNAME'],
	});
