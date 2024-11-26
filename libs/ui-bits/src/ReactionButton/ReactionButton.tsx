import classnames from 'classnames';
import SVG from 'react-inlinesvg';

import { Link } from '../Link';
import styles from './ReactionButton.module.sass';

export const reactionTypes = ['like', 'reply', 'echo', 'share'] as const;

export type ReactionType = (typeof reactionTypes)[number];
export type Orientation = 'Horizontal' | 'Vertical';

export type PostReactionHandler = () => void;
type Props = {
	disabled?: boolean;
	onClick?: PostReactionHandler;
	orientation?: Orientation;
	glyph: string;
	value?: number;
	className?: string;
};

export const ReactionButton = ({
	disabled,
	onClick,
	orientation,
	glyph,
	value,
	className,
}: Props) => {
	return (
		<span
			className={classnames(
				styles.Reaction,
				{
					[styles.disabled]: disabled,
					[styles.vertical]: orientation === 'Vertical',
				},
				className,
			)}
		>
			<Link disabled={disabled} onClick={onClick}>
				<SVG src={glyph} />
			</Link>
			{typeof value === 'number' && (
				<span className={styles.Stat}>{value}</span>
			)}
		</span>
	);
};
