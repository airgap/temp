import { findBestHardMove } from './findBestHardMove';
import { findBestNoviceMove } from './findBestNoviceMove';
import { MaybeMove, Player, BoardWithCountdown } from '@lyku/helpers';
import type { TtfFlowMode, User } from '@lyku/json-models';
import { users } from '@lyku/stock-docs';
import easy from './easy.json';
import medium from './medium.json';

export const ttfBots: Record<
	TtfFlowMode,
	{
		user: User;
		points: number;
		ai: (board: BoardWithCountdown, iAm: Player) => MaybeMove;
	}
> = {
	novice: {
		ai: findBestNoviceMove,
		points: 1,
		user: users.noviceTtfBot,
	},
	easy: {
		ai: (b, i) => easy[i][b] as MaybeMove,
		points: 2,
		user: users.easyTtfBot,
	},
	medium: {
		ai: (b, i) => medium[i][b] as MaybeMove,
		points: 3,
		user: users.mediumTtfBot,
	},
	hard: {
		ai: findBestHardMove,
		user: users.hardTtfBot,
		points: 4,
	},
} as const;
