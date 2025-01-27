import * as bcrypt from 'bcryptjs';
import { createSessionForUser } from '@lyku/route-helpers';
import { handleLoginUser } from '@lyku/handles';
const smartDelay = (start: number) =>
	new Promise((resolve) =>
		setTimeout(resolve, Math.max(0, 1000 - (performance.now() - start))),
	);
export default handleLoginUser(async ({ email, password }, ctx) => {
	const { db, strings } = ctx;
	const started = performance.now();
	const delay = () => smartDelay(started);
	const lowerEmail = email.toLocaleLowerCase();
	const existing = await db
		.selectFrom('userHashes')
		.selectAll()
		.where('email', '=', lowerEmail)
		.limit(1)
		.executeTakeFirst();
	if (!existing) {
		await delay();
		throw new Error(strings.emailNotFound);
	}
	// if (bot) throw new Error("You can't log in to a bot account, silly!");
	if (!existing.hash) {
		await delay();
		throw new Error('Account has no password');
	}
	const gucci = await bcrypt.compare(password, existing.hash);
	if (!gucci) {
		await delay();
		throw new Error(strings.incorrectPasswordError);
	}
	const sessionId = await createSessionForUser(existing.id, ctx);
	(ctx.responseHeaders as any).set('Set-Cookie', `sessionid=${sessionId}`);
	console.log('Logged user in');
	return { sessionId };
});
