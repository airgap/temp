import { handleGetTusEndpoint } from '@lyku/handles';
import { base58SnowflakeRegex } from '@lyku/helpers';
export const getTusEndpoint = handleGetTusEndpoint(
	async (_, { db, message, strings, response }) => {
		const id = message.url?.match(base58SnowflakeRegex)?.[0];
		if (!id) throw new Error('No ID specified');
		const draft = await db
			.selectFrom('videoDrafts')
			.select('uploadURL')
			.where('id', '=', id)
			.executeTakeFirst();
		if (!draft) throw new Error('No draft found');
		const location = draft.uploadURL;
		response.writeHead(301, {
			Location: location,
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods':
				'GET, POST, HEAD, OPTIONS, PUT, DELETE, PATCH',
			'Access-Control-Allow-Headers':
				'Authorization, Content-Type, tus-resumable, upload-length, Location, Allow-Headers',
			'Access-Control-Expose-Headers': 'Location',
		});

		return location;
	}
);
