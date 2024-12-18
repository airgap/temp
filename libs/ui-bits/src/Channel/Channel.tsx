import classnames from 'classnames';

import styles from './Channel.module.sass';

type Props = { channel: number; selected: boolean };

export const Channel = ({ channel, selected }: Props) => (
	<a
		href={`#${channel}`}
		className={classnames(styles.Channel, {
			[styles.selected]: selected,
		})}
	>
		{channel}
	</a>
);
