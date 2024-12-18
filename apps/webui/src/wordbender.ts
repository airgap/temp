import { gsap } from 'gsap';

interface Point2D {
	x: number;
	y: number;
}

interface Size2D {
	width: number;
	height: number;
}

interface LetterInfo {
	original: Point2D;
	moved: Point2D;
	size: Size2D;
	distance: number;
	angle: number;
}

export const wordbender = (dom = document) => {
	const timeline = gsap.timeline();
	const letters: HTMLElement[] = Array.from(
		document.getElementsByClassName('live'),
	) as HTMLElement[];
	const letterInfo: WeakMap<HTMLElement, LetterInfo> = new WeakMap();

	const layout = () => {
		letters.forEach((letter) => {
			const bounds = letter.getBoundingClientRect();
			let x = 0,
				y = 0,
				el: HTMLElement = letter;
			do {
				x += el.offsetLeft;
				y += el.offsetTop;

				el = el.offsetParent as HTMLElement;
			} while (el);
			letterInfo.set(letter, {
				original: {
					x: x - bounds.width / 2,
					y: y - bounds.height / 2,
				},
				moved: {
					x: x - bounds.width / 2,
					y: y - bounds.height / 2,
				},
				size: {
					width: bounds.width,
					height: bounds.height,
				},
				distance: 0,
				angle: 0,
			});
		});
	};

	const queueLayout = () => window.addEventListener('DOMContentLoaded', layout);

	queueLayout();
	document.addEventListener('mousemove', (e) => {
		letters.forEach((letter, l) => {
			if (!letter) {
				console.log('disposing');
				letters.splice(l, 1);
				return;
			}
			const info = letterInfo.get(letter);
			if (!info) throw new Error('lol idk m0');
			let x = 0,
				y = 0,
				el: HTMLElement = letter;
			do {
				x += el.offsetLeft;
				y += el.offsetTop;

				el = el.offsetParent as HTMLElement;
			} while (el);
			const delta = {
				x: e.x - x - info.size.width / 2,
				y: e.y - y - info.size.height / 2,
			};
			const distance = Math.max(
				0,
				Math.sqrt(delta.x * delta.x + delta.y * delta.y) + 20,
			);
			// if(distance > 100) return;
			info.moved = {
				x: (delta.x / distance) * 6,
				y: (delta.y / distance) * 6,
			};
			const scale = 1 + Math.min(0.25, (1 / distance) * 3);
			timeline.clear();
			timeline.to(letter, {
				scale,
				x: info.moved.x,
				y: info.moved.y,
				duration: 1,
			});
			// letter.style.transform = `scale(${scale})`;
		});
	});
};
