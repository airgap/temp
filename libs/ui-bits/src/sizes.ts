export const sizes = {
	s: 5,
	m: 10,
	l: 15,
	rs: '2pt',
	rm: '5pt',
	rl: '10pt',
} as const;

export type Size = keyof typeof sizes;
