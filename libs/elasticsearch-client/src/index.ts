import { Client, ClientOptions } from '@opensearch-project/opensearch';
const node = process.env['ELASTIC_CONNECTION_STRING'];
export const createElasticsearchClient = (options: ClientOptions = {}) =>
	new Client({
		node,
		// auth: apiKey ? { apiKey } : undefined,
		...options,
	});
export const client = createElasticsearchClient();
