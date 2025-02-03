import { handleListGames } from '@lyku/handles';

export default handleListGames(async (_, { db }) =>
	db.selectFrom('games').selectAll().execute()
);
