import { WebSocket } from 'ws';
import { ChangefeedOptions, Connection, Ex, Sequence } from 'rethinkdb';

export const feedSocket = async (
	socket: WebSocket,
	feedQuery: Ex<unknown> | Sequence<unknown>,
	connection: Connection,
	options?: ChangefeedOptions,
) => {
	const handle = await feedQuery
		.changes(options ?? {})
		.run(connection, (_, feed) =>
			feed.each(async (err, { new_val }) =>
				err ? console.error(err) : socket.send(JSON.stringify(new_val)),
			),
		);
	socket.onclose = () => {
		handle.close();
		console.log('Closed listener');
	};
};
