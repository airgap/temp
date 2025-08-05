import type { Score } from '@lyku/json-models';

export const filterByTimeFrame = (
	scores: Score[],
	timeFrame: 'day' | 'week' | 'month' | 'year' | 'all',
): Score[] =>
	scores.filter((score) => {
		const now = new Date();
		const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

		switch (timeFrame) {
			case 'day':
				start.setHours(0, 0, 0, 0);
				end.setHours(23, 59, 59, 999);
				break;
			case 'week':
				start.setDate(start.getDate() - start.getDay());
				end.setDate(end.getDate() + (6 - end.getDay()));
				break;
			case 'month':
				start.setDate(1);
				end.setMonth(end.getMonth() + 1);
				end.setDate(0);
				break;
			case 'year':
				start.setMonth(0);
				start.setDate(1);
				end.setMonth(11);
				end.setDate(31);
				break;
			case 'all':
				start.setFullYear(1970);
				end.setFullYear(2050);
				break;
		}

		return score.created >= start && score.created <= end;
	});
