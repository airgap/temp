import { handleListTtfMatches } from '@lyku/handles';

export default handleListTtfMatches(({ finished }, { db, requester }) =>
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
