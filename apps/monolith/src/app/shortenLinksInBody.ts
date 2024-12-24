import { newShortlink } from 'link-shortener-api-models';
import { basepath, shortenLink } from './shortenLink';
import { FromBsonSchema } from 'from-schema';

const urlRegex = new RegExp(
	'((http|ftp|https):\\/\\/)?([\\w_-]+(?:(?:\\.[\\w_-]+)+))([\\w.,@?^=%&:\\/~+#-]*[\\w@?^=%&\\/~+#-])',
	'g'
);
export const shortenLinksInBody = async (
	body: string,
	postId: string,
	userId: string
) => {
	const matches = body.match(urlRegex);
	if (!matches?.length) return body;
	const unique = [...new Set(matches)];
	const shortlinks = Object.fromEntries(
		await Promise.all(
			unique.map(async (url) => {
				const data = {
					url,
					authorId: userId,
					postId,
				} as FromBsonSchema<(typeof newShortlink)['request']>;
				const { code } = await shortenLink(data);
				return [url, `${basepath}/${code}`];
			})
		)
	);
	console.log('matches', matches, 'shortlinks', shortlinks);
	for (const match of matches) body = body.replace(match, shortlinks[match]);
	return body;
};
