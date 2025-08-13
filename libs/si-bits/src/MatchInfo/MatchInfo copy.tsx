import styles from './MatchInfo.module.sass';
import { useEffect, useState } from 'react';
import { api } from '@lyku/monolith-ts-api';
import classnames from 'classnames';
import { TtfMatch, User } from '@lyku/json-models';
import { localizeUsername } from '../localizeUsername';

export const MatchInfo = ({
	match,
	user,
}: {
	match?: TtfMatch;
	user?: User;
}) => {
	const [tried, setTried] = useState(false);
	const [xUser, setXUser] = useState<User>();
	const [oUser, setOUser] = useState<User>();
	const xTurn = match?.turn && match.turn % 2;
	const oTurn = match?.turn && match.turn % 2 === 0;
	useEffect(() => {
		if (match && !tried) {
			setTried(true);
			api
				.getUsers([match.X, match.O])
				.then(([x, o]) => {
					setXUser(x);
					setOUser(o);
				})
				.catch(console.error);
		}
	}, [match, tried]);
	return (
		<div className={styles.MatchInfo}>
			<div className={classnames(styles.x, { [styles.myTurn]: xTurn })}>
				{localizeUsername(xUser?.username)}
			</div>
			<div className={styles.vs}>vs</div>
			<div className={classnames(styles.o, { [styles.myTurn]: oTurn })}>
				{localizeUsername(oUser?.username)}
			</div>
		</div>
	);
};
