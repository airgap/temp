import { branch, now, uuid } from 'rethinkdb';

import { group, monolith } from 'models';
import { useContract } from '../Contract';
import { FromSchema } from 'from-schema';
import { bindIds } from 'helpers';

export const createGroup = useContract(
	monolith.createGroup,
	async (
		{ name, slug, private: p },
		{ tables, connection },
		{ userId },
		strings
	) => {
		if (!tables) {
			console.error('Tables missing');
			throw new Error(strings.unknownBackendError);
		}
		const lowerSlug = slug.toLowerCase();
		const user = tables.users.get(userId);
		const groups = tables.groups.getAll(userId, {
			index: 'owner',
		});
		const underLimit = groups.count().lt(user('groupLimit').default(50));
		const groupExists = tables.groups
			.filter((group) => group('slug').downcase().eq(lowerSlug))
			.limit(1)
			.count()
			.gt(0);
		const query = branch(
			groupExists,
			{ error: strings.groupAlreadyExists },
			branch(underLimit, { uuid: uuid() }, { error: strings.groupLimitReached })
		);
		const res = await query.run(connection);
		if ('error' in res) {
			throw new Error(res.error);
		}
		console.log('User exists and is below group limit. Query returned', res);
		const { uuid: id } = res;

		const g: FromSchema<typeof group> = {
			id,
			owner: userId,
			created: now() as unknown as string,
			name,
			slug: name.toLowerCase(),
			private: p,
			creator: userId,
		};
		await tables.groups.insert(g).run(connection);
		await tables.groupMemberships
			.insert(
				{
					group: id,
					user: userId,
					id: bindIds(userId, id),
					created: now(),
				},
				{ returnChanges: true }
			)('changes')(0)('new_val')
			.run(connection);
		return g;
	}
);
