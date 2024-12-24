import { bindIds } from '@lyku/helpers';
import { handleCreateGroup } from '@lyku/handles';
import { Group } from '@lyku/json-models/index';
import { sql } from 'kysely';

export const createGroup = handleCreateGroup(
	async ({ name, id, private: p }, { db, requester, strings }) => {
		const lowerSlug = id.toLowerCase();
		const user = await db
			.selectFrom('users')
			.selectAll()
			.where('id', '=', requester)
			.executeTakeFirst();
		if (!user) throw new Error('User not found');
		const groups = await db
			.selectFrom('groups')
			.selectAll()
			.where('owner', '=', requester)
			.execute();
		const underLimit = groups.length < user.groupLimit;
		const existingGroup = await db
			.selectFrom('groups')
			.selectAll()
			.where(sql`lower(id)`, '=', lowerSlug)
			.executeTakeFirst();

		if (existingGroup) {
			throw new Error(strings.groupAlreadyExists);
		}

		if (!underLimit) {
			throw new Error(strings.groupLimitReached);
		}

		const g: Group = {
			id,
			owner: requester,
			created: new Date(),
			name,
			private: p,
			creator: requester,
		};
		await db.insertInto('groups').values(g).execute();
		await db
			.insertInto('groupMemberships')
			.values({
				group: id,
				user: requester,
				id: bindIds(requester, id),
				created: new Date(),
			})
			.execute();
		return g;
	}
);
