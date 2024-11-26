export const prettyTime = (date: Date): string => {
	const now = new Date();
	const timeDiff = now.getTime() - date.getTime();

	const seconds = Math.floor(timeDiff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const weeks = Math.floor(days / 7);
	const months = Math.floor(days / 30.44); // Average number of days in a month
	const years = Math.floor(days / 365.25); // Average number of days in a year

	if (seconds < 60) {
		return `${seconds}s`;
	} else if (minutes < 60) {
		return `${minutes}m`;
	} else if (hours < 24) {
		return `${hours}h`;
	} else if (days < 7) {
		return `${days}d`;
	} else if (weeks < 4) {
		return `${weeks}w`;
	} else if (months < 12) {
		return `${months}mo`;
	} else {
		return `${years}y`;
	}
};
