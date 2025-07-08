export function getDocumentCookie(cookies: string, cname: string) {
	const name = cname + '=';
	// Handle both semicolon and ampersand separators
	const separator = cookies.includes(';') ? ';' : '&';
	const ca = cookies.split(separator);
	for (const element of ca) {
		let c = element;
		while (c.charAt(0) === ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
}
