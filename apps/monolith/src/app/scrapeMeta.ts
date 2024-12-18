// Import the fetch API and Cheerio, ensuring that these tools are available in your environment
import phin from 'phin';
import cheerio from 'cheerio';

export const scrapeMeta = (page: string) =>
	phin(page)
		.then((res) => {
			const html = res.body.toString();
			// Invoke the spirit of Cheerio to parse the HTML
			const $ = cheerio.load(html);
			// Sidenote: Fuck jQuery

			// Extract the sacred metadata, ensuring fallbacks if the preferred elements are not found
			const title =
				$('meta[property="og:title"]').attr('content') ||
				$('title').text() ||
				$('meta[name="title"]').attr('content');
			const description =
				$('meta[property="og:description"]').attr('content') ||
				$('meta[name="description"]').attr('content');
			const url = $('meta[property="og:url"]').attr('content');
			const site_name = $('meta[property="og:site_name"]').attr('content');
			const image =
				$('meta[property="og:image"]').attr('content') ||
				$('meta[property="og:image:url"]').attr('content');
			const icon =
				$('link[rel="icon"]').attr('href') ||
				$('link[rel="shortcut icon"]').attr('href');
			const keywords =
				$('meta[property="og:keywords"]').attr('content') ||
				$('meta[name="keywords"]').attr('content');

			// Output the sacred data or use it as per your requirement
			console.log({
				title,
				description,
				url,
				site_name,
				image,
				icon,
				keywords,
			});
		})
		.catch((error) => {
			// In the event of encountering a warp storm, log the error
			console.log(error);
		});
