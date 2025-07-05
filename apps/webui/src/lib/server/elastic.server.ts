import { Client } from '@elastic/elasticsearch';
import { ELASTIC_CONNECTION_STRING } from '$env/static/private';
export const client = new Client({
	node: ELASTIC_CONNECTION_STRING,
	// auth: {
	// 	apiKey: {
	// 		id: 'butts',
	// 		api_key: ELASTIC_API_KEY,
	// 	},
	// },
});
