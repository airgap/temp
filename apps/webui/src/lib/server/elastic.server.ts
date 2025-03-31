import { Client } from '@elastic/elasticsearch';
import { ELASTIC_API_ENDPOINT, ELASTIC_API_KEY } from '$env/static/private';
export const client = new Client({
	node: ELASTIC_API_ENDPOINT,
	auth: {
		apiKey: {
			id: 'butts',
			api_key: ELASTIC_API_KEY,
		},
	},
});
