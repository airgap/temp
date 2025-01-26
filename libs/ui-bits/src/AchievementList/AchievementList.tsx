import { useEffect, useState } from 'react';
import { AchievementGrant } from '@lyku/json-models';
import { api, sessionId } from 'monolith-ts-api';
import { AchievementTile } from '../AchievementTile';
import styles from './AchievementList.module.sass';
import classnames from 'classnames';
import { Await } from 'awaitx';
export const AchievementList = ({ game }: { game?: number }) => {
	const [grants, setGrants] = useState<AchievementGrant[]>([]);
	const [dropped, setDropped] = useState(false);
	useEffect(() => {
		if (sessionId)
			api
				.listenForAchievementGrants({ game })
				.listen((e) => setGrants((g) => g.concat(e)));
	}, [game]);
	console.log('grants', grants);
	return (
		<div
			className={classnames(styles.AchievementList, {
				[styles.dropped]: dropped,
			})}
			onClick={() => dropped || setDropped(true)}
		>
			<div
				className={styles.dropHeader}
				onClick={() => (dropped ? setDropped(false) : setDropped(true))}
			>
				{' '}
				<h2>Achievements</h2>
				<label className={styles.dropper}>
					<span>▼</span>
				</label>
			</div>
			<Await
				dependencies={[game]}
				source={() => api.listAchievements({ game })}
				then={(achievements) =>
					achievements.length ? (
						achievements
							.sort((a, b) => a.points - b.points)
							.map((ach) => (
								<AchievementTile
									key={ach.id}
									achievement={ach}
									granted={grants.some((g) =>
										g.id.startsWith(ach.id.toString())
									)}
								/>
							))
					) : (
						<h3>This game has no achievements yet -- check back soon!</h3>
					)
				}
				meanwhile={'Fetching achievements...'}
			/>
		</div>
	);
};
