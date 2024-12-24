import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { run } from '@lyku/route-helpers';
import { handleConfirmImageUpload } from '@lyku/handles';

// import { FormData } from 'http';

export const confirmImageUpload = handleConfirmImageUpload(
	async (id, { requester, strings, db }) => {
		console.log('Confirming image upload', id);
		if (!cfApiToken)
			throw new Error('We forgot to enter our Cloudflare password');

		// Find the image draft and verify ownership
		const imageDraft = await db
			.selectFrom('imageDrafts')
			.where('id', '=', id)
			.where('user', '=', requester)
			.selectAll()
			.executeTakeFirst();

		if (!imageDraft) throw new Error('Invalid image draft');

		const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1/${id}`;
		const command = `curl --request GET \\
    --url ${url} \\
    --header 'Content-Type: application/json' \\
    --header 'Authorization: Bearer ${cfApiToken}'`;
		const { stdout } = await run(command);
		const cfres = JSON.parse(stdout);
		console.log('CFRES', cfres);
		// const bod = cfres.body.toString();
		// console.log('bod', bod);
		// const json = JSON.parse(bod) as CreateStreamResponse;
		// console.log('Cloudflare image upload response:', json);
		if (!cfres.success) throw new Error(strings.imageUploadAuthorizationError);

		// Insert new image record
		const [record] = await db
			.insertInto('images')
			.values({
				...cfres.result,
				authorId: requester,
				supertype: 'image',
				uploaded: new Date(),
				...(imageDraft.channel ? { channelId: imageDraft.channel } : {}),
				...(imageDraft.reason ? { reason: imageDraft.reason } : {}),
			})
			.returningAll()
			.execute();

		if (!record) throw new Error(strings.unknownBackendError);
		const reason = imageDraft.reason;

		// Handle special image upload cases
		const postReasons = {
			ChannelLogo: 'logo',
			ActiveChannelBackground: 'activeBg',
			AwayChannelBackground: 'awayBg',
		};

		// Update channel or user profile based on reason
		if (reason && reason in postReasons && imageDraft.channel) {
			await db
				.updateTable('channels')
				.set({
					[postReasons[reason as keyof typeof postReasons]]: id,
				})
				.where('id', '=', imageDraft.channel)
				.execute();
		} else if (reason === 'ProfilePicture') {
			await db
				.updateTable('users')
				.set({ profilePicture: id })
				.where('id', '=', requester)
				.execute();
		}

		return cfres.result.id;
	}
);
