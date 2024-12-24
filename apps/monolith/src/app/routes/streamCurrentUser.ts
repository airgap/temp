import { monolith } from 'models';
import { useContract } from '../Contract';

export const streamCurrentUser = useContract(
	monolith.streamCurrentUser,
	(_, { tables, connection }, { socket, userId }) =>
		void tables.users
			.get(userId)
			.changes({ includeInitial: true })
			.run(connection, (err, feed) => {
				err
					? console.error(err)
					: feed.each(async (err, { new_val }) =>
							err ? console.error(err) : socket.send(JSON.stringify(new_val))
					  );
			})
);
