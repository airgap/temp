import { bindIds, Err, groupPermissions } from '@lyku/helpers';
import { handleCreateGroup } from '@lyku/handles';
import { Group } from '@lyku/json-models';
import { Insertable, sql } from 'kysely';
import { client as pg } from '@lyku/postgres-client';

export default handleCreateGroup(
	async ({ name, slug, private: p }, { requester, strings }) => {
		const lowerSlug = slug.toLowerCase();
		const user = await pg
			.selectFrom('users')
			.selectAll()
			.where('id', '=', requester)
			.executeTakeFirst();
		if (!user) throw new Error('User not found');
		const groups = await pg
			.selectFrom('groups')
			.selectAll()
			.where('owner', '=', requester)
			.execute();
		const underLimit = groups.length < user.groupLimit;
		const existingGroup = await pg
			.selectFrom('groups')
			.selectAll()
			.where('lowerSlug', '=', lowerSlug)
			.executeTakeFirst();

		if (existingGroup) {
			throw new Err(409, strings.groupAlreadyExists);
		}

		if (!underLimit) {
			throw new Err(403, strings.groupLimitReached);
		}

		const g = await pg
			.insertInto('groups')
			.values({
				slug,
				lowerSlug,
				owner: requester,
				created: new Date(),
				name,
				private: p,
				creator: requester,
				members: 1n,
			})
			.returningAll()
			.executeTakeFirstOrThrow();
		await pg
			.insertInto('groupMemberships')
			.values({
				group: g.id,
				user: requester,
				created: new Date(),
				updated: new Date(),
				permissions: groupPermissions,
			})
			.execute();
		return g;
	},
);
