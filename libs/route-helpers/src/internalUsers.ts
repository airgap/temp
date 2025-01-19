import { BoardWithCountdown, MaybeMove, Player } from './Player';
import { findBestNoviceMove } from './ais/findBestNoviceMove';
import * as ais from './ais';
import { findBestHardMove } from './ais/findBestHardMove';
import { TtfFlowMode, User } from '@lyku/json-models';
import { users } from '@lyku/stock-docs';

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
		ai: (b, i) => ais.easy[i][b] as MaybeMove,
		points: 2,
		user: users.easyTtfBot,
	},
	medium: {
		ai: (b, i) => ais.easy[i][b] as MaybeMove,
		points: 3,
		user: users.mediumTtfBot,
	},
	hard: {
		ai: findBestHardMove,
		user: users.hardTtfBot,
		points: 4,
	},
} as const;

export const ttfBotsById = new Map<
	bigint,
	(typeof ttfBots)[keyof typeof ttfBots]
>(Object.values(ttfBots).map((b) => [b.user.id, b]));

export const internalUsers: User[] = [
	users.guestUser,
	users.system,
	...Object.values(ttfBots).map((b) => b.user),
];
