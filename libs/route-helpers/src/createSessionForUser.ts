import { generateSessionId } from './generateSessionId';
import { client as pg } from '@lyku/postgres-client';

export const createSessionForUser = async (
	userId: bigint,
	request: Request,
): Promise<string> => {
	const id = generateSessionId();
	const userLogin = {
		created: new Date(),
		ip:
			(request.headers.get('CF-Connecting-IP') as string) ??
			request.headers.get('location') ??
			'',
		userId,
	};
	const s = {
		...userLogin,
		id,
		expiration: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000),
	};
	await Promise.all([
		pg.insertInto('logins').values(userLogin).execute(),
		pg.insertInto('sessions').values(s).execute(),
	]);
	return id;
};
