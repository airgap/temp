import type { Score } from '@lyku/json-models';
import { DateTime } from 'luxon';

export const filterByTimeFrame = (
	scores: Score[],
	timeFrame: 'day' | 'week' | 'month' | 'year' | 'all',
): Score[] =>
	scores.filter((score) => {
		// Get current time in EST
		const nowEST = DateTime.now().setZone('America/New_York');
		let startEST: DateTime;
		let endEST: DateTime;

		switch (timeFrame) {
			case 'day':
				startEST = nowEST.startOf('day');
				endEST = nowEST.endOf('day');
				break;
			case 'week':
				// Week starts on Monday in luxon by default
				startEST = nowEST.startOf('week');
				endEST = nowEST.endOf('week');
				break;
			case 'month':
				startEST = nowEST.startOf('month');
				endEST = nowEST.endOf('month');
				break;
			case 'year':
				startEST = nowEST.startOf('year');
				endEST = nowEST.endOf('year');
				break;
			case 'all':
				startEST = DateTime.fromObject(
					{ year: 1970 },
					{ zone: 'America/New_York' },
				);
				endEST = DateTime.fromObject(
					{ year: 2050 },
					{ zone: 'America/New_York' },
				);
				break;
		}

		// Convert boundaries back to JS Dates (in UTC) for comparison
		const start = startEST.toJSDate();
		const end = endEST.toJSDate();

		return score.created >= start && score.created <= end;
	});
