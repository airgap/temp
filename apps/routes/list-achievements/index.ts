import { handleListAchievements } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleListAchievements(({ game }, { requester }) =>
	pg.selectFrom('achievements').selectAll().where('game', '=', game).execute(),
);
