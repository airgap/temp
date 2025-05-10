import { handleListChannelVideos } from '@lyku/handles';
import { User } from '@lyku/json-models';
import { client as pg } from '@lyku/postgres-client';
export default handleListChannelVideos(async (users, { requester }) => {
	return [];
	// const unsorted = await pg
	// 	.selectFrom('users')
	// 	.selectAll()
	// 	.where('id', 'in', users)
	// 	.execute();
	// const sorted: User[] = [];
	// for (const u of users) {
	// 	const i = unsorted.findIndex(({ id }) => id === u);
	// 	sorted.push(unsorted[i]);
	// 	unsorted.splice(i, 1);
	// }
	// return sorted;
});
