import { handleGetLeaderboard } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';

export default handleGetLeaderboard((id, { requester }) =>
	pg
		.selectFrom('leaderboards')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirstOrThrow(),
);
