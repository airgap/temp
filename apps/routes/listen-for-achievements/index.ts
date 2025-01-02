import { handleGetUsers } from '@lyku/handles';
import { User } from '@lyku/json-models';

export const getUsers = handleGetUsers(async ({ users }, { db }) => {
	const unsorted = await db
		.selectFrom('users')
		.selectAll()
		.where('id', 'in', users)
		.execute();
	const sorted: User[] = [];
	for (const u of users) {
		const i = unsorted.findIndex(({ id }) => id === u);
		sorted.push(unsorted[i]);
		unsorted.splice(i, 1);
	}
	return sorted;
});
