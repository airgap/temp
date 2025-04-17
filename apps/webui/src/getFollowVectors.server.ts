import type { Database } from '@lyku/db-config/kysely';
import type { User } from '@lyku/json-models';
import type { Kysely } from 'kysely';

export const getFollowVectors = async (
	db: Kysely<Database>,
	users: bigint[],
	user?: User,
) => {
	if (!user) return [];
	const rawFollows = await db
		.selectFrom('userFollows')
		.select('followee')
		.where('follower', '=', user.id)
		.where('followee', 'in', users)
		.execute();
	const followVectors = users.map((a) =>
		rawFollows.some((f) => f.followee === a) ? a : -a,
	);
	return followVectors;
};
