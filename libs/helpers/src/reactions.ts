export const reactions = [
	'👍',
	'👎',
	'👏',
	'👋',
	'👌',
	'💖',
	'♥️',
	'🧡',
	'💙',
	'💜',
	'💛',
	'💚',
	'🤍',
	'🖤',
	'🤎',
	'💔',
] as const;

export type Reaction = (typeof reactions)[number];
