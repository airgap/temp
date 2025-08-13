import { api } from '@lyku/monolith-ts-api';
import { useEffect, useMemo, useState } from 'react';
import { MatchProposal, User } from '@lyku/json-models';
import { Button } from '../Button';
import { Link } from '../Link';
import { ProfilePicture } from '../ProfilePicture';
import { localizeUsername } from '../localizeUsername';
import styles from './MatchProposalList.module.sass';
import { Divisio } from '../Divisio';
import { useCacheData } from '../CacheProvider';

export const MatchProposalList = ({
	user,
	onClose,
}: {
	user: User;
	onClose: () => void;
}) => {
	const [proposals, setProposals] = useState<MatchProposal[]>([]);

	const [queried, setQueried] = useState(false);
	useEffect(() => {
		if (queried) return;
		setQueried(true);
		api.listMatchProposals({}).then(({ proposals, users }) => {
			const mine: MatchProposal[] = [];
			const theirs: MatchProposal[] = [];
			for (const proposal of proposals)
				(proposal.to === user.id ? mine : theirs).push(proposal);
			setProposals([...mine, ...theirs]);
		});
	}, [queried, user.id]);
	const userList = useMemo(() => {
		return [
			...new Set(
				proposals.map((p) => p.from).concat(proposals.map((p) => p.to)),
			),
		];
	}, [proposals]);
	const [users] = useCacheData('users', userList);
	return (
		<div className={styles.MatchList}>
			<table>
				<tr>
					<td>
						<Button onClick={onClose}>&lt; Back</Button>
					</td>
				</tr>
				{proposals.length ? (
					proposals.map((proposal) => {
						const toMe = proposal.to === user.id;
						const theirId = toMe ? proposal.from : proposal.to;
						const them = users?.find((u) => u.id === theirId);
						if (!them) return <>They are absent</>;
						return (
							<tr>
								<td>
									<ProfilePicture
										url={toMe ? them.profilePicture : user.profilePicture}
									/>
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
										{toMe && (
											<Divisio size="m" layout="h">
												<Link href={'#' + proposal.id} className={styles.Play}>
													Accept
												</Link>
												<Link href={'#' + proposal.id} className={styles.Play}>
													Ignore
												</Link>
											</Divisio>
										)}
									</Divisio>
								</td>
								<td>
									<ProfilePicture
										url={toMe ? user.profilePicture : them.profilePicture}
									/>
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
						Invites from friends will appear here
					</i>
				)}
			</table>
		</div>
	);
};
