import { generateSessionId } from './generateSessionId';
import { MaybeSecureHttpContext } from './Contexts';

export const createSessionForUser = async (
	userId: bigint,
	ctx: MaybeSecureHttpContext<any>,
): Promise<string> => {
	const id = generateSessionId();
	const userLogin = {
		created: new Date(),
		ip:
			(ctx.request.headers.get('CF-Connecting-IP') as string) ??
			ctx.request.headers.get('location') ??
			'',
		userId,
	};
	const s = {
		...userLogin,
		id,
		expiration: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000),
	};
	await Promise.all([
		ctx.db.insertInto('logins').values(userLogin).execute(),
		ctx.db.insertInto('sessions').values(s).execute(),
	]);
	return id;
};
