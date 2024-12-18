// import { monolith } from 'models';
// import { row } from 'rethinkdb';

// import { useContract } from '../Contract';
// import { getUserId } from '../getUserId';
// import { newGameSession } from '../newGameSession';

// export const bounced = useContract(
// 	monolith.bounced,
// 	async ({ edge, corner }, { tables, connection }, msg) => {
// 		const hit = edge || corner;
// 		const oldStats = row('gameStats');

// 		const currentStats = oldStats('current');
// 		const currentEdges = currentStats('edges');
// 		const currentCorners = currentStats('corners');

// 		const totalStats = oldStats('total');
// 		const totalEdges = totalStats('edges');
// 		const totalCorners = totalStats('corners');

// 		const highestStats = oldStats('highest');
// 		const highestEdges = highestStats('edges');
// 		const highestCorners = highestStats('corners');

// 		const current = hit
// 			? {
// 					edges: edge ? currentEdges.add(1) : currentEdges,
// 					corners: corner ? currentCorners.add(1) : currentCorners,
// 				}
// 			: newGameSession();
// 		const highest = hit
// 			? {
// 					edges: currentEdges
// 						.add(1)
// 						.gt(highestEdges)
// 						.branch(currentEdges.add(1), highestEdges),
// 					corners: currentCorners
// 						.add(1)
// 						.gt(highestCorners)
// 						.branch(currentCorners.add(1), highestCorners),
// 				}
// 			: {};

// 		const total = hit
// 			? {
// 					edges: edge ? totalEdges.add(1) : totalEdges,
// 					corners: corner ? totalCorners.add(1) : totalCorners,
// 				}
// 			: newGameSession();
// 		const gameStats = {
// 			current,
// 			total,
// 			highest,
// 		};
// 		const userId = await getUserId(msg, tables, connection);
// 		const query = tables.users.get(userId).update({ gameStats });
// 		console.log('current', current, 'total', total);
// 		const result = await query.run(connection);
// 		console.log('bounce result', result);
// 		return {};
// 	},
// );
