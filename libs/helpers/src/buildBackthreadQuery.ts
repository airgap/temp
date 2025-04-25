export const buildBackthreadQuery = (posts: { id: bigint; score: number }[]) =>
	posts.flatMap((post) => [
		{},
		{
			size: 1,
			sort: [{ _score: 'desc' }],
			query: {
				bool: {
					filter: [
						{ term: { replyTo: post.id } },
						{ range: { _score: { gte: 0.1 * post.score } } },
					],
				},
			},
		},
	]);
