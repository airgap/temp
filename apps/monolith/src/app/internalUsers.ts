import { BoardWithCountdown, MaybeMove, Player } from './Player';
import { findBestNoviceMove } from './ais/findBestNoviceMove';
import * as ais from './ais';
import { findBestHardMove } from './ais/findBestHardMove';
import { FromSchema } from 'from-schema';
import {
	easyTtfBot,
	guestUser,
	hardTtfBot,
	mediumTtfBot,
	noviceTtfBot,
	systemUser,
	ttfFlowMode,
	user,
} from 'models';

export const ttfBots: Record<
	FromSchema<typeof ttfFlowMode>,
	{
		user: FromSchema<typeof user>;
		points: number;
		ai: (board: BoardWithCountdown, iAm: Player) => MaybeMove;
	}
> = {
	novice: {
		ai: findBestNoviceMove,
		points: 1,
		user: noviceTtfBot,
	},
	easy: {
		ai: (b, i) => ais.easy[i][b] as MaybeMove,
		points: 2,
		user: easyTtfBot,
	},
	medium: {
		ai: (b, i) => ais.easy[i][b] as MaybeMove,
		points: 3,
		user: mediumTtfBot,
	},
	hard: {
		ai: findBestHardMove,
		user: hardTtfBot,
		points: 4,
	},
} as const;

export const ttfBotsById = Object.fromEntries(
	Object.values(ttfBots).map((b) => [b.user.id, b])
);

export const internalUsers: FromSchema<typeof user>[] = [
	guestUser,
	systemUser,
	...Object.values(ttfBots).map((b) => b.user),
];
