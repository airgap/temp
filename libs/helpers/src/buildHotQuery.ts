export type DateRange = 'hour' | 'day' | 'week' | 'month' | 'year';

export const rangeMap: Record<DateRange, string> = {
	hour: 'now-1h/h',
	day: 'now-1d/d',
	week: 'now-7d/d',
	month: 'now-30d/d',
	year: 'now-1y/y',
};

export const buildHotQuery = ({
	dateRange,
	size,
}: {
	dateRange?: DateRange;
	size?: number;
}) => ({
	size: size ?? 100,
	sort: ['_score', 'publish:desc'],
	// search_after: continuation,
	query: {
		function_score: {
			query: {
				bool: {
					filter: dateRange
						? [{ range: { publish: { gte: rangeMap[dateRange] } } }]
						: [],
				},
			},
			score_mode: 'multiply',
			boost_mode: 'replace',
			functions: [
				{
					field_value_factor: {
						field: 'engagement_score',
						modifier: 'log1p',
						factor: 1,
						missing: 0,
					},
				},
				{
					exp: {
						publish: {
							origin: 'now',
							scale: dateRange ? rangeMap[dateRange].replace('now-', '') : '7d',
							decay: 0.5,
						},
					},
				},
			],
		},
	},
});
