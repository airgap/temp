import { prettyTime } from '@lyku/helpers';

import styles from './DynamicDate.module.sass';

export const DynamicDate = (props: { time: Date }) => (
	<span className={styles.DynamicDate}>{prettyTime(props.time)}</span>
);
