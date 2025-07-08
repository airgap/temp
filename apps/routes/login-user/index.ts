import * as bcrypt from 'bcryptjs';
import { createSessionForUser, verifyHCaptcha } from '@lyku/route-helpers';
import { handleLoginUser } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
import { Err } from '@lyku/helpers';
const smartDelay = (start: number) =>
	new Promise((resolve) =>
		setTimeout(resolve, Math.max(0, 1000 - (performance.now() - start))),
	);
export default handleLoginUser(async ({ email, password, captcha }, ctx) => {
	const { strings } = ctx;

	const address = ctx.server.requestIP(ctx.request);
	console.log('Address:', address);
	if (!address) throw new Err(500, 'Unable to get client IP address');
	await verifyHCaptcha({
		remoteip: address.address,
		response: captcha,
	});
	const started = performance.now();
	const delay = () => smartDelay(started);
	const lowerEmail = email.toLocaleLowerCase();
	const existing = await pg
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
	const sessionId = await createSessionForUser(existing.id, ctx.request);
	const origin = ctx.request.headers.get('origin');
	const domain = origin?.startsWith('https://lyku.org')
		? `Domain=lyku.org;`
		: '';
	(ctx.responseHeaders as any).set(
		'Set-Cookie',
		`sessionId=${sessionId}; Path=/; Secure; SameSite=Lax; ${domain} Max-Age=31536000`,
	);
	console.log('Logged user in');
	return { sessionId };
});
