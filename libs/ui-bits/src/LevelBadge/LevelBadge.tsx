import { getLevelFromPoints, getProgressToNextLevel } from '@lyku/helpers';
import { useEffect, useState } from 'react';

import styles from './LevelBadge.module.sass';

function arcradius(cx: number, cy: number, radius: number, degrees: number) {
	const radians = ((degrees - 90) * Math.PI) / 180.0;
	return {
		x: cx + radius * Math.cos(radians),
		y: cy + radius * Math.sin(radians),
	};
}

const cfloor = (decimals = 0) => {
	const imprecision = Math.pow(10, decimals);
	return (n: number) => Math.floor(n * imprecision) / imprecision;
};
type Slice = { value: number };

type GProps = { index: number; value: number; data: Slice; d: string };

function Donut(
	cx: number,
	cy: number,
	radius: number,
	data: { value: number }[],
) {
	const floor = cfloor(4);
	const f2 = cfloor(2);
	let total = 0;
	const arr: GProps[] = [];
	let beg = 0;
	let end = 0;
	let count = 0;

	for (let i = 0; i < data.length; i++) total += data[i].value;

	for (let i = 0; i < data.length; i++) {
		const item = data[i];
		// const tmp = {};

		let p = f2(((item.value + 1) / total) * 100);

		count += p;

		if (i === data.length - 1 && count < 100) p = p + (100 - count);

		end = beg + (360 / 100) * p;

		const b = arcradius(cx, cy, radius, end);
		const e = arcradius(cx, cy, radius, beg);
		const la = end - beg <= 180 ? 0 : 1;

		const tmp: GProps = {
			index: i,
			value: item.value,
			data: item,
			d: [
				'M',
				floor(b.x),
				floor(b.y),
				'A',
				radius,
				radius,
				0,
				la,
				0,
				floor(e.x),
				floor(e.y),
			].join(' '),
		};
		arr.push(tmp);
		beg = end;
	}

	return arr;
}

const sizes = {
	s: 25,
	m: 50,
	l: 100,
} as const;
type Size = keyof typeof sizes;

type Props = {
	points: number;
	progress?: boolean;
	size?: Size;
};
const bg = '#ffffff55';
export const LevelBadge = (props: Props) => {
	const [size, setSize] = useState(0);
	const [half, setHalf] = useState(0);
	useEffect(() => {
		const s = sizes[props.size ?? 's'];
		setSize(s);
		setHalf(s / 2);
	}, [props.size]);

	const [level, setLevel] = useState<number>(
		getLevelFromPoints(props.points),
	);
	const [progress, setProgress] = useState<number>(
		getProgressToNextLevel(props.points),
	);
	const [text, setText] = useState(``);
	const [donut, setDonut] = useState('');
	const [__html, set__Html] = useState('');
	useEffect(() => {
		setLevel(getLevelFromPoints(props.points));
		setProgress(Math.round(getProgressToNextLevel(props.points)));
	}, [props.points]);
	useEffect(() => {
		setText(
			`<text x='${half}' y='${half}' text-anchor='middle' dy='.375em' fill='white' font-size='${half}'>${level}</text>`,
		);
	}, [level, half]);
	useEffect(() => {
		const data = [{ value: 100 - progress }, { value: progress || 1 }],
			color = progress ? [bg, 'white'] : [bg, 'transparent'],
			girth = size / 8,
			radius = (size - girth) / 2;
		const arr = Donut(half, half, radius, data);
		let html = '';
		for (let i = 0; i < arr.length; i++) {
			const item = arr[i];
			html += `<g><path d='${item.d}' stroke='${color[i]}' fill='none' stroke-width='${girth}' /></g>`;
		}
		setDonut(html);
	}, [progress, size, half]);
	useEffect(() => {
		set__Html(donut + text);
	}, [donut, text]);
	return (
		<svg
			className={styles.LevelBadge}
			width={size}
			height={size}
			dangerouslySetInnerHTML={{ __html }}
		></svg>
	);
};
