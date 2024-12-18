import * as bcrypt from 'bcryptjs';
import { Insertable, now, or } from 'rethinkdb';

import { useContract } from '../Contract';
import { createSessionForUser } from '../createSessionForUser';
import { FromSchema } from 'from-schema';
import { user, monolith } from 'models';
import { cfAccountId, cfApiToken } from '../env';
import * as jdenticon from 'jdenticon';
import { FormData } from 'formdata-node';

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

export const registerUser = useContract(
	monolith.registerUser,
	async (
		{ email, username, password },
		{ tables, connection },
		{ msg },
		strings,
		res,
	) => {
		const lowerEmail = email.toLocaleLowerCase();
		const lowerUsername = username.toLocaleLowerCase();
		if (lowerUsername.includes('lyku'))
			throw new Error('Usernames cannot contain "lyku"');
		console.log('Checking for', lowerEmail, 'or', lowerUsername);
		const existing = await tables.users
			.filter<true>((doc) =>
				or(
					// doc('email').eq(lowerEmail),
					doc('username').downcase().eq(lowerUsername),
				),
			)
			.count()
			.gt(0)
			.run(connection);
		if (existing) throw new Error(strings.emailTaken);
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
			},
		);

		const cfres = (await response.json()) as UrlImageUploadResponse;
		const u: Insertable<FromSchema<typeof user>> = {
			bot: false,
			banned: false,
			confirmed: false,
			username,
			chatColor: 'FFFFFF',
			live: false,
			lastLogin: now() as unknown as string,
			joined: now() as unknown as string,
			postCount: 0,
			...(cfres.success ? { profilePicture: cfres.result.id } : {}),
			points: 0,
			slug: lowerUsername,
		};
		console.log('Inserting user', u);
		const { generated_keys } = await tables.users.insert(u).run(connection);
		if (!generated_keys.length) throw new Error(strings.unknownBackendError);
		const [userId] = generated_keys;
		await tables.userHashes
			.insert({
				email,
				username,
				id: userId,
				hash: passhash,
			})
			.run(connection);
		const sessionId = await createSessionForUser(
			userId,
			msg,
			tables,
			connection,
		);
		res.setHeader('Set-Cookie', `sessionid=${sessionId}; Path=/;`);
		console.log('Logged user in', sessionId);
		return sessionId;
	},
);
