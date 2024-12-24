import phin from 'phin';
import { CreateStreamResponse } from '../CreateStreamResponse';
import { cfAccountId, cfApiToken } from '../env';
import { handleCreateChannel } from '@lyku/handles';

export const createChannel = handleCreateChannel(
	async ({ name }, { db, requester, strings }) => {
		const user = await db
			.selectFrom('users')
			.where('id', '=', requester)
			.executeTakeFirst();
		if (!user) throw new Error(strings.unknownBackendError);
		const channels = await db
			.selectFrom('channels')
			.where('owner', '=', requester)
			.execute();
		const underLimit = channels.length < (user.channelLimit || 2);
		const channelExists = db
			.selectFrom('channels')
			.getAll(name, {
				index: 'name',
			})
			.limit(1)
			.count()
			.gt(0);
		const query = branch(
			channelExists,
			{ error: strings.channelAlreadyExists },
			branch(
				underLimit,
				{ uuid: uuid() },
				{ error: strings.channelLimitReached }
			)
		);
		const res = await query.run(connection);
		if (!res) {
			console.error('idk wtf happened but res is undefined');
			throw new Error(strings.unknownBackendError);
		}
		if ('error' in res) {
			throw new Error(res.error);
		}
		console.log('User exists and is below channel limit. Query returned', res);
		const { uuid: id } = res;
		const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/live_inputs`;

		const c: FromSchema<typeof channel> = {
			live: false,
			id,
			owner: userId,
			created: now() as unknown as string,
			name,
			slug: name.toLowerCase(),
		};
		const insertResult = await tables.channels.insert(c).run(connection);
		console.log('Inserted channel', id, 'in database', insertResult);
		console.log('phin', phin);
		const cfres = await phin({
			url,
			method: 'POST',
			headers: {
				Authorization: `Bearer ${cfApiToken}`,
			},
			data: {
				defaultCreator: id,
				recording: {
					mode: 'automatic',
					allowedOrigins: [
						'lyku.org',
						'www.lyku.org',
						'bouncing.tv',
						'www.bouncing.tv',
					],
				},
			},
		});
		const json = JSON.parse(cfres.body.toString()) as CreateStreamResponse;
		console.log('Cloudflare stream creation response:', json);
		if (!json.success) throw new Error(strings.streamCreationError);
		const channelUpdateResult = await tables.channels
			.get(c.id)
			.update({ whepKey: json.result.webRTCPlayback.url })
			.run(connection);
		await tables.channelSensitives
			.insert({
				inputId: json.result.uid,
				rtmpsKey: json.result.rtmps.streamKey,
				srtUrl: json.result.srt.url,
				whipUrl: json.result.webRTC.url,
				// whepKey: json.result.webRTCPlayback.url,
			})
			.run(connection);
		console.log('Inserted channel in database', channelUpdateResult);
		return { channel: c };
	}
);
