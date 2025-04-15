import type { Database } from '@lyku/db-config/kysely';
import type { Kysely } from 'kysely';

export const getFollowVectors = async (
	user: bigint,
	users: bigint[],
	db: Kysely<Database>,
) => {
	const rawFollows = await db
		.selectFrom('userFollows')
		.select('followee')
		.where('follower', '=', user)
		.where('followee', 'in', users)
		.execute();
	const followVectors = users.map((a) =>
		rawFollows.some((f) => f.followee === a.id) ? a.id : -a.id,
	);
	return followVectors;
};
