import { handleAcceptMatchProposal } from '@lyku/handles';
import { gameStarters } from './internalGames';
import { client as pg } from '@lyku/postgres-client';
export default handleAcceptMatchProposal(async (id, ctx) => {
	const proposal = await pg
		.selectFrom('matchProposals')
		.where('id', '=', id)
		.selectAll()
		.executeTakeFirst();

	if (!proposal) throw new Error('404');

	const { game } = proposal;
	if (!(game in gameStarters)) throw new Error('500');

	const start = gameStarters[game as keyof typeof gameStarters];
	if (!start) throw new Error('Invalid game starter');

	const matchId = await start(proposal, ctx);

	await pg.deleteFrom('matchProposals').where('id', '=', id).execute();

	console.log('Deleted accepted proposal');
	return BigInt(matchId);
});
