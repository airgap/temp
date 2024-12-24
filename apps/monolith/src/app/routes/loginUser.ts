import { monolith } from 'models';
import * as bcrypt from 'bcryptjs';

import { useContract } from '../Contract';
import { createSessionForUser } from '../createSessionForUser';

export const loginUser = useContract(
	monolith.loginUser,
	async (
		{ email, password },
		{ tables, connection },
		{ msg },
		strings,
		res
	) => {
		const lowerEmail = email.toLocaleLowerCase();
		const existing = await tables.userHashes
			.getAll(lowerEmail, {
				index: 'email',
			})
			.limit(1)
			.coerceTo('array')
			.run(connection);
		if (!existing.length) throw new Error(strings.emailNotFound);
		const [{ id: userId, hash }] = existing;
		// if (bot) throw new Error("You can't log in to a bot account, silly!");
		if (!hash) throw new Error('Account has no password');
		const gucci = await bcrypt.compare(password, hash);
		if (!gucci) throw new Error(strings.incorrectPasswordError);
		const sessionId = await createSessionForUser(
			userId,
			msg,
			tables,
			connection
		);
		res.setHeader('Set-Cookie', `sessionid=${sessionId}`);
		console.log('Logged user in');
		return { sessionId };
	}
);
