import { handleListGames } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleListGames(async (params, { requester }) => {
	let q = pg.selectFrom('games').selectAll();
	if (params.developer) q = q.where('developer', '=', params.developer);
	if (params.publisher) q = q.where('publisher', '=', params.publisher);
	if (params.hint) q = q.where('title', 'like', `%${params.hint}%`);
	const games = await q.execute();
	let developerIds = [];
	let publisherIds = [];
	for (const { developer, publisher } of games) {
		if (publisher) publisherIds.push(publisher);
		if (developer) developerIds.push(developer);
	}
	console.log('developerIds', developerIds);
	console.log('publisherIds', publisherIds);
	const developers = await pg
		.selectFrom('developers')
		.selectAll()
		.where('id', 'in', developerIds)
		.execute();
	const publishers = publisherIds.length ?await pg
		.selectFrom('publishers')
		.selectAll()
		.where('id', 'in', publisherIds)
		.execute() : [];
	return { games, developers, publishers };
});
