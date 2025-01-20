import { handleBounced } from '@lyku/handles';

export default handleBounced(async ({ edge, corner }, { db, requester }) => {
	const hit = edge || corner;

	// Get current user stats
	const oldStats = await db
		.selectFrom('btvStats')
		.where('user', '=', requester)
		.selectAll()
		.executeTakeFirst();

	if (!oldStats) {
		throw new Error('User not found');
	}

	// Calculate new stats
	const newCurrentEdges = hit
		? edge
			? oldStats.currentEdges + 1n
			: oldStats.currentEdges
		: 0n;
	const newCurrentCorners = hit
		? corner
			? oldStats.currentCorners + 1n
			: oldStats.currentCorners
		: 0n;

	const newHighestEdges = hit
		? newCurrentEdges > oldStats.highestEdges
			? newCurrentEdges
			: oldStats.highestEdges
		: oldStats.highestEdges;
	const newHighestCorners = hit
		? newCurrentCorners > oldStats.highestCorners
			? newCurrentCorners
			: oldStats.highestCorners
		: oldStats.highestCorners;

	const newTotalEdges = hit
		? edge
			? oldStats.totalEdges + 1n
			: oldStats.totalEdges
		: oldStats.totalEdges;
	const newTotalCorners = hit
		? corner
			? oldStats.totalCorners + 1n
			: oldStats.totalCorners
		: oldStats.totalCorners;

	const gameStats = {
		totalTime: oldStats.totalTime,
		totalEdges: newTotalEdges,
		totalCorners: newTotalCorners,
		currentTime: oldStats.currentTime,
		currentEdges: newCurrentEdges,
		currentCorners: newCurrentCorners,
		highestTime: oldStats.highestTime,
		highestEdges: newHighestEdges,
		highestCorners: newHighestCorners,
		sessionCount: oldStats.sessionCount,
	};

	// Update user stats
	await db
		.updateTable('btvStats')
		.set(gameStats)
		.where('user', '=', requester)
		.executeTakeFirstOrThrow();

	return {
		current: {
			edges: Number(newCurrentEdges),
			corners: Number(newCurrentCorners),
		},
		total: {
			edges: Number(newTotalEdges),
			corners: Number(newTotalCorners),
		},
	};
});
