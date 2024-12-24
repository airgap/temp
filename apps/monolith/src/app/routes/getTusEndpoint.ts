import { useContract } from '../Contract';
import { monolith, uid } from 'models';

const uuidRegex = new RegExp(uid.pattern.substring(1, uid.pattern.length - 1));
export const getTusEndpoint = useContract(
	monolith.getTusEndpoint,
	async (_, { tables, connection }, { msg }, strings, response) => {
		if (!tables) {
			console.error('Tables fucked');
			throw new Error(strings.unknownBackendError);
		}
		const id = msg.url?.match(uuidRegex)?.[0];
		if (!id) throw new Error('No ID specified');
		const location = await tables.videoDrafts
			.get(id)('uploadURL')
			.run(connection);
		if (!location) throw new Error('No location found');
		response.writeHead(301, {
			Location: location,
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods':
				'GET, POST, HEAD, OPTIONS, PUT, DELETE, PATCH',
			'Access-Control-Allow-Headers':
				'Authorization, Content-Type, tus-resumable, upload-length, Location, Allow-Headers',
			'Access-Control-Expose-Headers': 'Location',
		});

		return;
	}
);
