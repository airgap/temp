export const TimestampDate = ({ timestamp }: { timestamp: number }) => {
	const [date, time] = new Date(timestamp).toISOString().split('T');
	return (
		<>
			{date} at
			<br />
			{time}
		</>
	);
};
