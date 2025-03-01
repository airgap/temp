import * as bcrypt from 'bcryptjs';
import { createSessionForUser } from '@lyku/route-helpers';
import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import * as jdenticon from 'jdenticon';
import { FormData } from 'formdata-node';
import { handleRegisterUser } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import {
	InsertableUser,
	InsertableBtvStats,
	InsertableUserHash,
	InsertableFriendList,
	InsertableMembershipList,
} from '@lyku/json-models';

// Custom identicon style
// https://jdenticon.com/icon-designer.html?config=652966ff0111303054545454
jdenticon.configure({
	lightness: {
		color: [0.84, 0.84],
		grayscale: [0.84, 0.84],
	},
	saturation: {
		color: 0.48,
		grayscale: 0.48,
	},
	backColor: '#652966',
});

type UIURBase = {
	messages: string[];
};

type UIURSuccess = UIURBase & {
	result: {
		id: string;
		filename: string;
		metadata: Record<string, string>;
		uploaded: string;
		requireSignedURLs: boolean;
		variants: string[];
	};
	success: true;
	errors: [];
};

type UIURFailure = UIURBase & {
	errors: string[];
	success: false;
};

type UrlImageUploadResponse = UIURSuccess | UIURFailure;

export default handleRegisterUser(async (params, ctx) => {
	console.log('params', params);
	const { email, username, password } = params;
	const { db, requester, responseHeaders, strings } = ctx;
	const lowerEmail = email.toLocaleLowerCase();
	const lowerUsername = username.toLocaleLowerCase();
	if (lowerUsername.includes('lyku'))
		throw new Err(400, 'Usernames cannot contain "lyku"');
	const existingUser = await db
		.selectFrom('users')
		.select(['id'])
		.where('username', '=', lowerUsername)
		.executeTakeFirst();
	if (existingUser) throw new Err(400, strings.emailTaken);
	const existingEmail = await db
		.selectFrom('userHashes')
		.select(['id'])
		.where('email', '=', lowerEmail)
		.executeTakeFirst();
	if (existingEmail) throw new Err(400, strings.emailTaken);
	console.log('Hashing password');
	const passhash = await bcrypt.hash(password, 10);
	console.log('Generating jdenticon');
	const png = jdenticon.toPng(lowerUsername, 512);

	// Upload image to Cloudflare first since it's external and can't be part of our DB transaction
	console.log('Uploading jdenticon');
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${cfApiToken}`,
			},
			body: new Blob([png], { type: 'image/png' }),
		},
	);

	const cfres = (await response.json()) as UrlImageUploadResponse;

	console.log('Uploaded jdenticon', cfres);

	// Start transaction for all database operations
	const result = await db.transaction().execute(async (trx) => {
		const insertedUser = await trx
			.insertInto('users')
			.values({
				bot: false,
				banned: false,
				confirmed: false,
				username,
				chatColor: 'FFFFFF',
				groupLimit: 0,
				staff: false,
				lastSuper: new Date(),
				live: false,
				lastLogin: new Date(),
				joined: new Date(),
				postCount: 0n,
				...(cfres.success ? { profilePicture: cfres.result.id } : {}),
				points: 0n,
				slug: lowerUsername,
			} satisfies InsertableUser)
			.returningAll()
			.executeTakeFirst();

		if (!insertedUser) throw new Err(500, strings.unknownBackendError);

		await trx
			.insertInto('btvStats')
			.values({
				user: insertedUser.id,
				totalTime: 0,
				totalEdges: 0n,
				totalCorners: 0n,
				currentTime: 0,
				currentEdges: 0n,
				currentCorners: 0n,
				highestTime: 0,
				highestEdges: 0n,
				highestCorners: 0n,
				sessionCount: 0n,
			} satisfies InsertableBtvStats)
			.executeTakeFirstOrThrow();

		await trx
			.insertInto('userHashes')
			.values({
				email,
				username,
				id: insertedUser.id,
				hash: passhash,
				created: new Date(),
			} satisfies InsertableUserHash)
			.execute();

		await trx
			.insertInto('friendLists')
			.values({
				user: insertedUser.id,
				friends: [],
				count: 0,
				created: new Date(),
			} satisfies InsertableFriendList)
			.execute();

		await trx
			.insertInto('membershipLists')
			.values({
				user: insertedUser.id,
				groups: [],
				count: 0,
				created: new Date(),
			} satisfies InsertableMembershipList)
			.execute();

		const sessionId = await createSessionForUser(insertedUser.id, ctx);
		(responseHeaders as Headers).set(
			'Set-Cookie',
			`sessionId=${sessionId}; Path=/; Secure; SameSite=Lax; HttpOnly; Domain=lyku.org; Max-Age=31536000`,
		);
		console.log('Logged user in', sessionId);

		return sessionId;
	});
	return result;
});
