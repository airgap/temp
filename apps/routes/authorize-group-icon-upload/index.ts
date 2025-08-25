import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { handleAuthorizeGroupIconUpload } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
import { InsertableGroupIconDraft } from '@lyku/json-models';
import { Err } from '@lyku/helpers';
export default handleAuthorizeGroupIconUpload(
	async (group, { requester, strings }) => {
		if (!cfApiToken)
			throw new Error('We forgot to enter our Cloudflare password');

		const groupRecord = await pg
			.selectFrom('groups')
			.select('owner')
			.where('id', '=', group)
			.executeTakeFirst();

		if (!groupRecord) throw new Err(404, 'Group not found');
		if (groupRecord.owner !== requester)
			throw new Err(403, 'You are not the owner of this group');
		const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v2/direct_upload`;
		const metadata = {
			creator: requester.toString(),
			reason: 'GroupIcon',
			group: group.toString(),
			// ...(channelId ? { channelId: channelId.toString() } : {}),
		} satisfies InsertableGroupIconDraft;

		const formData = new FormData();
		formData.append('requireSignedURLs', 'false');
		formData.append('metadata', JSON.stringify(metadata));

		const response = await Bun.fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${cfApiToken}`,
			},
			body: formData,
		});

		const cfres = await response.json();
		if (!cfres.success) throw new Error(strings.imageUploadAuthorizationError);

		const iconDraft = {
			...cfres.result,
			hostId: cfres.result.id,
			creator: requester,
			group,
		} satisfies InsertableGroupIconDraft;
		delete iconDraft.id;
		const draft = await pg
			.insertInto('groupIconDrafts')
			.values(iconDraft)
			.returning('id')
			.executeTakeFirstOrThrow();
		if (!draft) throw new Err(500, 'Failed to create group icon draft');
		console.log('Draft', draft);
		return { id: draft.id, url: cfres.result.uploadURL };
	},
);
