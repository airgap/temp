import * as bcrypt from 'bcryptjs';
import { createSessionForUser } from '@lyku/route-helpers';
import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import * as jdenticon from 'jdenticon';
import { FormData } from 'formdata-node';
import { handleRegisterUser } from '@lyku/handles';

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

export default handleRegisterUser(
	async ({ email, username, password }, ctx) => {
		const { db, requester, responseHeaders, strings } = ctx;
		const lowerEmail = email.toLocaleLowerCase();
		const lowerUsername = username.toLocaleLowerCase();
		if (lowerUsername.includes('lyku'))
			throw new Error('Usernames cannot contain "lyku"');
		const existingUser = await db
			.selectFrom('users')
			.select(['id'])
			.where('username', '=', lowerUsername)
			.executeTakeFirst();
		if (existingUser) throw new Error(strings.emailTaken);
		const existingEmail = await db
			.selectFrom('userHashes')
			.select(['id'])
			.where('email', '=', lowerEmail)
			.executeTakeFirst();
		if (existingEmail) throw new Error(strings.emailTaken);
		console.log('Hashing password');
		const passhash = await bcrypt.hash(password, 10);
		console.log('Generating jdenticon');
		const png = jdenticon.toPng(lowerUsername, 512);
		console.log('Forming');
		const formData = new FormData();
		console.log('A');
		const blob = new Blob([png], { type: 'image/png' });
		console.log('blob', blob, 'username', lowerUsername);
		formData.set('file', blob, lowerUsername + '.png');
		console.log('B');
		formData.set('requireSignedURLs', 'false');
		console.log('C');
		formData.set('metadata', JSON.stringify({ eatAss: 'smokeGrass' }));
		console.log('Uploading jdenticon');
		console.log('cf', cfAccountId, 'bear', cfApiToken);
		const response = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${cfApiToken}`,
				},
				body: blob,
			}
		);

		const cfres = (await response.json()) as UrlImageUploadResponse;
		const insertedUser = await db
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
			})
			.returningAll()
			.executeTakeFirst();
		if (!insertedUser) throw new Error(strings.unknownBackendError);
		await db
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
			})
			.executeTakeFirstOrThrow();
		const userId = insertedUser.id;
		await db
			.insertInto('userHashes')
			.values({
				email,
				username,
				id: userId,
				hash: passhash,
			})
			.execute();
		const sessionId = await createSessionForUser(userId, ctx);
		(responseHeaders as Headers).set(
			'Set-Cookie',
			`sessionid=${sessionId}; Path=/;`
		);
		console.log('Logged user in', sessionId);
		return sessionId;
	}
);
