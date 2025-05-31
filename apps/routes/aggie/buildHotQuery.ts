export type DateRange = 'hour' | 'day' | 'week' | 'month' | 'year';

export const rangeMap: Record<DateRange, string> = {
	hour: 'now-1h',
	day: 'now-1d',
	week: 'now-7d',
	month: 'now-30d',
	year: 'now-1y',
} as const;

export const scaleMap: Record<DateRange, string> = {
	hour: '1h',
	day: '1d',
	week: '7d',
	month: '30d',
	year: '365d',
} as const;

export const buildHotQuery = ({
	dateRange = 'year',
	size,
}: {
	dateRange?: DateRange;
	size?: number;
}) =>
	({
		index: 'posts-20*',
		size: size ?? 100,
		sort: ['_score', { publish: { order: 'desc' } }],
		// search_after: continuation,
		query: {
			function_score: {
				query: {
					bool: {
						filter: [
							{ range: { publish: { gte: rangeMap[dateRange], lte: 'now' } } },
						],
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
								scale: scaleMap[dateRange],
								decay: 0.5,
							},
						},
					},
				],
			},
		},
	}) as const;
