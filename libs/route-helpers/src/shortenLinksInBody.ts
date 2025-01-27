import type { Insertable, Kysely } from 'kysely';
import { join } from 'path';
import { shortlinkBasepath } from './env';
import { Database } from '@lyku/db-config/kysely';
import { ShortlinkRow } from '@lyku/json-models';
const urlRegex = new RegExp(
	'((http|ftp|https):\\/\\/)?([\\w_-]+(?:(?:\\.[\\w_-]+)+))([\\w.,@?^=%&:\\/~+#-]*[\\w@?^=%&\\/~+#-])',
	'g',
);
export const shortenLinksInBody = async (
	body: string,
	post: bigint,
	author: bigint,
	db: Kysely<Database>,
) => {
	const matches = body.match(urlRegex);
	if (!matches?.length) return body;
	const unique = [...new Set(matches)];
	const shortlinks = Object.fromEntries(
		(
			await db
				.insertInto('shortlinks')
				.values(
					unique.map((url) => ({
						url,
						author,
						post,
					})),
				)
				.returning(['id', 'url'])
				.execute()
		).map(({ id, url }) => [url, join(shortlinkBasepath, id.toString())]),
	);
	console.log('matches', matches, 'shortlinks', shortlinks);
	for (const match of matches) body = body.replace(match, shortlinks[match]);
	return body;
};
