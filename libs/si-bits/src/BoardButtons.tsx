import { TtfMatch } from '@lyku/json-models';

export const BoardButtons = ({
	match,
	onClick,
}: {
	match: TtfMatch;
	onClick: (i: number) => void;
}) => (
	<div
		style={{
			position: 'absolute',
			width: '100%',
			height: '100%',
		}}
	>
		{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
			const piece = match?.board[i];
			const placed = piece !== '-';
			return (
				<button
					disabled={placed}
					key={i}
					tabIndex={i + 1}
					style={{
						width: '33.33%',
						height: '33.33%',
						background: '#00000000',
						cursor: placed ? 'cursor' : 'pointer',
						display: 'inline-block',
						position: 'relative',
						verticalAlign: 'middle',
						border: 'none',
					}}
					onClick={() => onClick(i)}
				/>
			);
		})}
	</div>
);
