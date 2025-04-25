import type { Database } from '@lyku/db-config/kysely';
import type {
	FriendRequest,
	Friendship,
	FriendshipStatus,
} from '@lyku/json-models';
import type { Kysely } from 'kysely';
import { bondIds } from '@lyku/helpers';

export const getFriendshipStatuses = async (
	db: Kysely<Database>,
	authors: bigint[],
	user?: bigint,
) => {
	if (!user) return [];
	const bonds = authors.map((a) => bondIds(a, user));
	const rawFriendships = bonds.length
		? await db
				.selectFrom('friendships')
				.selectAll()
				.where('id', 'in', bonds)
				.execute()
		: [];
	const friendshipMap = new Map<bigint, Friendship>(
		rawFriendships.map((f) => [BigInt(f.id), f]),
	);
	const rawFriendRequests = bonds.length
		? await db
				.selectFrom('friendRequests')
				.selectAll()
				.where('id', 'in', bonds)
				.execute()
		: [];
	const friendRequestMap = new Map<bigint, FriendRequest>(
		rawFriendRequests.map((f) => [BigInt(f.id), f]),
	);

	const friendships: [bigint, FriendshipStatus][] = authors.map((a) => {
		let status: FriendshipStatus;
		if (friendshipMap.has(a)) status = 'befriended';
		else {
			const request = friendRequestMap.get(a);
			if (!request) status = 'none';
			else if (request.from === a) status = 'theyOffered';
			else status = 'youOffered';
		}
		return [a, status] as [bigint, FriendshipStatus];
	});
	return friendships;
};
