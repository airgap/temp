import { handleListGames } from '@lyku/handles';

export default handleListGames(async (_, { db, requester }) => {
	const query = db
		.selectFrom('games')
		.selectAll()
		.where('user', '=', requester);
});
