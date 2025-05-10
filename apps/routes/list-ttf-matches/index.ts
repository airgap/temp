import { handleListTtfMatches } from '@lyku/handles';
import { client as db } from '@lyku/postgres-client';

export default handleListTtfMatches(({ finished }, { requester }) =>
	db
		.selectFrom('ttfMatches')
		.where(({ or, eb }) =>
			or([eb('X', '=', requester), eb('O', '=', requester)]),
		)
		.where((eb) =>
			finished ? eb('winner', 'is not', null) : eb('winner', 'is', null),
		)
		.selectAll()
		.execute(),
);
