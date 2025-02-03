import { useEffect, useState } from 'react';
import O from './assets/o.png';
import X from './assets/x.png';
import { TtfMatch } from '@lyku/json-models';

const images = { O, X };
type Piece = {
	x: number;
	y: number;
	p: 'X' | 'O';
	i: number;
	key: number;
};

export const Piece = ({
	x,
	y,
	p,
	i,
	key,
}: {
	x: number;
	y: number;
	p: 'X' | 'O';
	i: number;
	key: number;
}) => {
	const [grown, setGrown] = useState(false);
	useEffect(() => {
		requestAnimationFrame(() => setGrown(true));
	}, []);
	return (
		<img
			key={key}
			style={{
				position: 'absolute',
				width: '33.33%',
				height: '33.33%',
				transition: `all .5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${
					Math.random() * 0.3
				}s`,
				transform: `scale(${grown ? 75 : 0}%)`,
				left: 33.33 * x + '%',
				top: 33.33 * y + '%',
				opacity: i < 9 ? 1 : 0,
				pointerEvents: 'none',
			}}
			src={images[p]}
			alt={p}
		/>
	);
};
export const Pieces = ({ match }: { match: TtfMatch }) => {
	const [lastTurn, setLastTurn] = useState<number>();
	const [lastBoard, setLastBoard] = useState<string>();
	// const columns = useState<[string[], string[], string[]]>();
	const [pieces, setPieces] = useState<Piece[]>([]);
	useEffect(() => {
		if (lastTurn) {
			if (match.turn !== lastTurn && lastBoard) {
				console.log('blah blah');
				const pcs = match.turn < lastTurn ? [] : [...pieces];
				if (match.turn % 3 === 1) {
					for (let i = 0; i < 6; i++) {
						if (match.board[3 + i] !== lastBoard[i]) {
							const piece = {
								x: i % 3,
								y: Math.floor(i / 3),
								p: match.board[3 + i] as 'X' | 'O',
								i,
								key: match.turn * 81 + i,
							};
							const index = pcs.findIndex(({ i }) => i > piece.i) - 1;
							pcs.splice(index < 0 ? 0 : index, 0, piece);
						}
					}
					setPieces(pcs);
					setTimeout(() => {
						setPieces((prevState) =>
							prevState
								.map(({ x, y, p, i, key }) => ({
									x,
									p,
									y: y + 1,
									i: i + 3,
									key,
								}))
								.filter(({ i }) => i < 12)
						);
					}, 500);
				} else {
					for (let i = 0; i < 9; i++) {
						if (match.board[i] !== lastBoard[i]) {
							const piece = {
								x: i % 3,
								y: Math.floor(i / 3),
								p: match.board[i] as 'X' | 'O',
								i,
								key: match.turn * 81 + i,
							};
							const index = pcs.findIndex(({ i }) => i > piece.i) - 1;
							pcs.splice(index < 0 ? 0 : index, 0, piece);
						}
					}
					setPieces(pcs);
				}
			}
		} else if (!(lastBoard || lastTurn)) {
			setPieces(
				match.board
					.split('')
					.map(
						(p, i) =>
							p !== '-' &&
							({
								x: i % 3,
								y: ~~(i / 3),
								p,
								i,
								key: match.turn * 81 + i,
							} as Piece)
					)
					.filter((p) => p) as Piece[]
			);
		}
		setLastBoard(match.board);
		setLastTurn(match.turn);
	}, [match, lastBoard, lastTurn, pieces]);
	return (
		<div className="board-pieces">
			{pieces.map(({ x, y, p, i, key }) => (
				<Piece x={x} y={y} p={p} i={i} key={key} />
			))}
		</div>
	);
};
