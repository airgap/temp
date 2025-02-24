export const dateToPostgresString = (date: Date | string) => {
	// Ensure we're working with a Date object
	const dateObj = date instanceof Date ? date : new Date(date);

	// Format: YYYY-MM-DD HH:MM:SS.sss
	return dateObj.toISOString().slice(0, 19).replace('T', ' ');
};
