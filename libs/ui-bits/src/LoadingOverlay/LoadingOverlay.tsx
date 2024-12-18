import classnames from 'classnames';
import hidden from '../hidden.module.sass';
import { Loading } from './Loading';
import styles from './LoadingOverlay.module.sass';

export const LoadingOverlay = ({ shown }: { shown?: boolean }) => (
	<div
		className={classnames(styles.LoadingOverlay, {
			[hidden.hidden]: !shown,
		})}
	>
		<Loading />
	</div>
);
