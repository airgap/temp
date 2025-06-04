export const sizes = {
	s: '5px',
	m: '10px',
	l: '20px',
	rs: '5pt',
	rm: '10pt',
	rl: '20pt',
} as const;

export type Size = keyof typeof sizes;
