import { prettyTime } from '@lyku/helpers';

import styles from './DynamicDate.module.sass';

export const DynamicDate = (props: { time: string }) => (
	<span className={styles.DynamicDate}>
		{prettyTime(new Date(props.time))}
	</span>
);
