import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { handleAuthorizePfpUpload } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
import { InsertablePfpDraft } from '@lyku/json-models';
import { Err } from '@lyku/helpers';
export default handleAuthorizePfpUpload(async (_, { requester, strings }) => {
	if (!cfApiToken)
		throw new Error('We forgot to enter our Cloudflare password');

	const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v2/direct_upload`;
	const metadata = {
		creator: requester.toString(),
		reason: 'ProfilePicture',
		// ...(channelId ? { channelId: channelId.toString() } : {}),
	} satisfies InsertablePfpDraft;

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

	const pfpDraft = {
		...cfres.result,
		hostId: cfres.result.id,
		creator: requester,
	} satisfies InsertablePfpDraft;
	delete pfpDraft.id;
	const draft = await pg
		.insertInto('pfpDrafts')
		.values(pfpDraft)
		.returning('id')
		.executeTakeFirstOrThrow();
	if (!draft) throw new Err(500, 'Failed to create pfp draft');
	console.log('Draft', draft);
	return { id: draft.id, url: cfres.result.uploadURL };
});
