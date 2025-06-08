import { handleGetTusEndpoint } from '@lyku/handles';
import { base58SnowflakeRegex } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';
export default handleGetTusEndpoint(
	async (_, { request, strings, responseHeaders }) => {
		const id = request.url?.match(base58SnowflakeRegex)?.[0];
		if (!id) throw new Error('No ID specified');
		const draft = await pg
			.selectFrom('fileDrafts')
			.select('uploadURL')
			.where('id', '=', id)
			.executeTakeFirst();
		if (!draft) throw new Error('No draft found');
		const location = draft.uploadURL;
		Object.assign(responseHeaders, {
			Location: location,
			'Access-Control-Allow-Origin': 'https://lyku.org',
			'Access-Control-Allow-Methods':
				'GET, POST, HEAD, OPTIONS, PUT, DELETE, PATCH',
			'Access-Control-Allow-Headers':
				'Authorization, Content-Type, tus-resumable, upload-length, Location, Allow-Headers',
			'Access-Control-Expose-Headers': 'Location',
			status: '301',
		});

		return location;
	},
);
