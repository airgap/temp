export function getEndOfPeriod(
	timeFrame: 'day' | 'week' | 'month' | 'year' | 'all',
): Date {
	const now = new Date();
	const end = new Date();

	switch (timeFrame) {
		case 'day':
			// End of current day (midnight)
			end.setHours(23, 59, 59, 999);
			break;
		case 'week':
			// End of current week (Sunday at 23:59:59)
			const daysUntilSunday = 7 - now.getDay();
			end.setDate(now.getDate() + daysUntilSunday);
			end.setHours(23, 59, 59, 999);
			break;
		case 'month':
			// End of current month
			end.setMonth(now.getMonth() + 1, 0);
			end.setHours(23, 59, 59, 999);
			break;
		case 'year':
			// End of current year
			end.setFullYear(now.getFullYear(), 11, 31);
			end.setHours(23, 59, 59, 999);
			break;
		case 'all':
			// No expiry for all time
			return new Date(8640000000000000); // Max date
	}

	return end;
}

export function formatCountdown(milliseconds: number): string {
	if (milliseconds <= 0) return 'Expired';

	const seconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const weeks = Math.floor(days / 7);

	// Format based on time remaining
	if (weeks >= 1) {
		// Show weeks and days (ww:dd)
		const remainingDays = days % 7;
		return `${weeks.toString().padStart(2, '0')}w ${remainingDays.toString().padStart(2, '0')}d`;
	} else if (days >= 1) {
		// Show days and hours (dd:hh)
		const remainingHours = hours % 24;
		return `${days.toString().padStart(2, '0')}d ${remainingHours.toString().padStart(2, '0')}h`;
	} else {
		// Show hours, minutes, seconds (hh:mm:ss)
		const remainingMinutes = minutes % 60;
		const remainingSeconds = seconds % 60;
		return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	}
}

export function getStartOfPeriod(
	timeFrame: 'day' | 'week' | 'month' | 'year' | 'all',
): Date {
	const now = new Date();
	const start = new Date();

	switch (timeFrame) {
		case 'day':
			// Start of current day (midnight)
			start.setHours(0, 0, 0, 0);
			break;
		case 'week':
			// Start of current week (Monday at 00:00:00)
			const day = now.getDay();
			const daysFromMonday = day === 0 ? 6 : day - 1;
			start.setDate(now.getDate() - daysFromMonday);
			start.setHours(0, 0, 0, 0);
			break;
		case 'month':
			// Start of current month
			start.setDate(1);
			start.setHours(0, 0, 0, 0);
			break;
		case 'year':
			// Start of current year
			start.setMonth(0, 1);
			start.setHours(0, 0, 0, 0);
			break;
		case 'all':
			// Arbitrary start date
			return new Date(0);
	}

	return start;
}

export function getCountdownColor(percentage: number): string {
	if (percentage > 50) {
		// Green
		return '#22c55e';
	} else if (percentage > 25) {
		// Yellow
		return '#eab308';
	} else if (percentage > 10) {
		// Orange
		return '#f97316';
	} else {
		// Red
		return '#ef4444';
	}
}

export function getTimeRemaining(
	timeFrame: 'day' | 'week' | 'month' | 'year' | 'all',
): {
	milliseconds: number;
	formatted: string;
	percentage: number;
	color: string;
} {
	if (timeFrame === 'all') {
		return {
			milliseconds: Infinity,
			formatted: '∞',
			percentage: 100,
			color: '#22c55e',
		};
	}

	const now = new Date();
	const start = getStartOfPeriod(timeFrame);
	const end = getEndOfPeriod(timeFrame);

	const totalMilliseconds = end.getTime() - start.getTime();
	const remainingMilliseconds = end.getTime() - now.getTime();
	const percentage = Math.max(
		0,
		Math.min(100, (remainingMilliseconds / totalMilliseconds) * 100),
	);
	const color = getCountdownColor(percentage);

	return {
		milliseconds: remainingMilliseconds,
		formatted: formatCountdown(remainingMilliseconds),
		percentage,
		color,
	};
}
