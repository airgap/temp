import { handleListGames } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleListGames(async (_, { requester }) =>
	pg.selectFrom('games').selectAll().execute(),
);
