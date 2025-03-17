import { arcradius } from './arcradius';
import { cfloor } from './cfloor';

export function makeDonut(
	cx: number,
	cy: number,
	radius: number,
	data: { value: number }[],
) {
	const floor = cfloor(4);
	const f2 = cfloor(2);
	let total = 0;
	const arr = [];
	let beg = 0;
	let end = 0;
	let count = 0;

	for (let i = 0; i < data.length; i++) total += data[i].value;

	for (let i = 0; i < data.length; i++) {
		const item = data[i];
		let p = f2(((item.value + 1) / total) * 100);
		count += p;

		if (i === data.length - 1 && count < 100) p = p + (100 - count);
		end = beg + (360 / 100) * p;

		const b = arcradius(cx, cy, radius, end);
		const e = arcradius(cx, cy, radius, beg);
		const la = end - beg <= 180 ? 0 : 1;

		arr.push({
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
		});
		// There once was a hobbit who lived in
		beg = end;
	}

	return arr;
}
