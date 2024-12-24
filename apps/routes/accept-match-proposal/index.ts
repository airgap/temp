import { handleAcceptMatchProposal } from '@lyku/handles';
import { gameStarters } from './internalGames';
import type { MatchProposal } from '@lyku/types';

export const acceptMatchProposal = handleAcceptMatchProposal(
	async (id, ctx) => {
		const proposal = (await ctx.db
			.selectFrom('matchProposals')
			.where('id', '=', id)
			.selectAll()
			.executeTakeFirst()) as MatchProposal | undefined;

		if (!proposal) throw new Error('404');

		const { game } = proposal;
		if (!(game in gameStarters)) throw new Error('500');

		const start = gameStarters[game as keyof typeof gameStarters];
		if (!start) throw new Error('Invalid game starter');

		const matchId = await start(proposal, ctx);

		await ctx.db.deleteFrom('matchProposals').where('id', '=', id).execute();

		console.log('Deleted accepted proposal');
		return BigInt(matchId);
	}
);
