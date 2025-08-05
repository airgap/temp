import type { Score } from '@lyku/json-models';

export const highestScoreByPlayer = (scores: Score[]) => [
	...scores
		.reduce((acc, score) => {
			if (score.columns[0] > (acc.get(score.user)?.columns[0] ?? 0)) {
				acc.set(score.user, score);
			}
			return acc;
		}, new Map<bigint, Score>())
		.values(),
];
