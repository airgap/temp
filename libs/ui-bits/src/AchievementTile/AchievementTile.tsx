import { Achievement } from '@lyku/json-models';
import classNames from 'classnames';
import styles from './AchievementTile.module.sass';
import { Image } from '../Image';

export const AchievementTile = ({
	achievement,
	granted,
}: {
	achievement: Achievement;
	granted?: boolean;
}) => (
	<span
		onClick={() => alert('Coming soon!')}
		className={classNames(styles.AchievementTile, {
			[styles.granted]: granted,
		})}
	>
		<Image url={achievement.icon} />
		<div className={styles.content}>
			{' '}
			<h3>{achievement.name}</h3>
			<p>{achievement.description}</p>
		</div>
	</span>
);
