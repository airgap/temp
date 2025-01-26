import { bindIds } from '@lyku/helpers';
import { handleCreateGroup } from '@lyku/handles';
import { Group } from '@lyku/json-models/index';
import { Insertable, sql } from 'kysely';

export default handleCreateGroup(
	async ({ name, slug, private: p }, { db, requester, strings }) => {
		const lowerSlug = slug.toLowerCase();
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

		const g = await db
			.insertInto('groups')
			.values({
				slug,
				lowerSlug,
				owner: requester,
				created: new Date(),
				name,
				private: p,
				creator: requester,
			} as Group)
			.returningAll()
			.executeTakeFirstOrThrow();
		await db
			.insertInto('groupMemberships')
			.values({
				group: g.id,
				user: requester,
				id: bindIds(requester, g.id),
				created: new Date(),
			})
			.execute();
		return g;
	}
);
