import { Client, ClientOptions } from '@elastic/elasticsearch';
const node = process.env['ELASTIC_API_ENDPOINT'];
const apiKey = process.env['ELASTIC_API_KEY'];
export const createElasticsearchClient = (options: ClientOptions = {}) =>
	new Client({
		node,
		auth: apiKey ? { apiKey } : undefined,
		...options,
	});
export const client = createElasticsearchClient();
