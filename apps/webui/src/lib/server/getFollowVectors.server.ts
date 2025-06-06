import type { Database } from '@lyku/db-types';
import type { Kysely } from 'kysely';

export const getFollowVectors = async (
	db: Kysely<Database>,
	users: bigint[],
	user?: bigint,
) => {
	if (!user) return [];
	const rawFollows = await db
		.selectFrom('userFollows')
		.select('followee')
		.where('follower', '=', user)
		.where('followee', 'in', users)
		.execute();
	const followVectors = users.map((a) =>
		rawFollows.some((f) => f.followee === a) ? a : -a,
	);
	return followVectors;
};
