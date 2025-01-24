import { api } from 'monolith-ts-api';
import { useEffect, useState } from 'react';
import { TtfMatch, User } from '@lyku/json-models';
import { Button } from '../Button';
import { Link } from '../Link';
import { ProfilePicture } from '../ProfilePicture';
import { localizeUsername } from '../localizeUsername';
import styles from './MatchList.module.sass';
import { Divisio } from '../Divisio';
import { useCacheData } from '../CacheProvider';

export const MatchList = ({
	user,
	onClose,
}: {
	user: User;
	onClose: () => void;
}) => {
	const [matches, setMatches] = useState<TtfMatch[]>([]);

	const [queried, setQueried] = useState(false);
	useEffect(() => {
		if (queried) return;
		setQueried(true);
		api.listTtfMatches({ finished: false }).then((matches) => {
			const mine: TtfMatch[] = [];
			const theirs: TtfMatch[] = [];
			for (const match of matches)
				(match.whoseTurn === user.id ? mine : theirs).push(match);
			setMatches([...mine, ...theirs]);
		});
	}, [queried, user.id]);
	const [users] = useCacheData(
		'users',
		matches.flatMap((m) => [m.X, m.O]),
	);
	return (
		<div className={styles.MatchList}>
			<table>
				<tr>
					<td>
						<Button onClick={onClose}>&lt; Back</Button>
					</td>
				</tr>
				{matches.length ? (
					matches.map((match) => {
						const mine = match.whoseTurn === user.id;
						const theirId = mine ? match.O : match.X;
						const them = users?.find((u) => u.id === theirId);
						if (!them) return <>They are absent</>;
						// if (!them) return match.X === user.id ? match.O : match.X;
						return (
							<tr>
								<td>
									<ProfilePicture url={user.profilePicture} />
								</td>
								<td
									style={{
										verticalAlign: 'top',
									}}
								>
									<Divisio size={'rs'} layout={'v'}>
										<table style={{ fontSize: '.8em' }}>
											<tr>
												<td>You</td>
												<td>{localizeUsername(them.username)}</td>
											</tr>
										</table>
										{mine ? (
											<Link href={'#' + match.id} className={styles.Play}>
												Play your turn
											</Link>
										) : (
											<i
												style={{
													opacity: 0.5,
												}}
											>
												Their turn
											</i>
										)}
									</Divisio>
								</td>
								<td>
									<ProfilePicture url={them.profilePicture} />
								</td>
							</tr>
						);
					})
				) : (
					<i
						style={{
							opacity: 0.5,
							marginTop: '31%',
							display: 'block',
						}}
					>
						Active matches will appear here
					</i>
				)}
			</table>
		</div>
	);
};
