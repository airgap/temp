import { handleGetTusEndpoint } from '@lyku/handles';
import { base58SnowflakeRegex } from '@lyku/helpers';
export default handleGetTusEndpoint(
	async (_, { db, request, strings, responseHeaders }) => {
		const id = request.url?.match(base58SnowflakeRegex)?.[0];
		if (!id) throw new Error('No ID specified');
		const draft = await db
			.selectFrom('videoDrafts')
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
