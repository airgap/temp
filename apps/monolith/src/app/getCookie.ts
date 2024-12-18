export function getCookie(cookies: string, cname: string) {
	const name = cname + '=';
	const ca = cookies.split(';');
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
