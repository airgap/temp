import { handleListAchievementGrants } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';

export default handleListAchievementGrants(async ({ game }, { requester }) => {
	const q = pg.selectFrom('achievementGrants').selectAll();

	if (game) q.where('game', '=', game);

	return q.execute();
});
