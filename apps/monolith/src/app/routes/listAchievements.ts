import { handleListAchievements } from '@lyku/handles';

export const listAchievements = handleListAchievements(({ game }, { db }) => {
	const query = db.selectFrom('achievements');

	if (game) {
		query.where('game', '=', game);
	}

	return query.selectAll().execute();
});
