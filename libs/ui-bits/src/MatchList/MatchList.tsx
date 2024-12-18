import { api } from 'monolith-ts-api';
import { useEffect, useState } from 'react';
import { TtfMatch, User } from '@lyku/json-models';
import { Button } from '../Button';
import { Link } from '../Link';
import { ProfilePicture } from '../ProfilePicture';
import { localizeUsername } from '../localizeUsername';
import styles from './MatchList.module.sass';
import { Divisio } from '../Divisio';

export const MatchList = ({
	user,
	onClose,
}: {
	user: User;
	onClose: () => void;
}) => {
	const [matches, setMatches] = useState<TtfMatch[]>([]);
	const [users, setUsers] = useState<Map<bigint, User>>(new Map());

	const [queried, setQueried] = useState(false);
	useEffect(() => {
		if (queried) return;
		setQueried(true);
		api.listTtfMatches({ finished: false }).then(({ matches, users }) => {
			const mine: TtfMatch[] = [];
			const theirs: TtfMatch[] = [];
			for (const match of matches)
				(match.whoseTurn === user.id ? mine : theirs).push(match);
			setMatches([...mine, ...theirs]);
			setUsers(Object.fromEntries(users.map((u) => [u.id, u])));
		});
	}, [queried, user.id]);
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
						const them = users.get(match.X === user.id ? match.O : match.X);
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
