import { api, sessionId } from 'monolith-ts-api';
import { useEffect, useState } from 'react';
import { Group, GroupFilter, GroupMembership } from '@lyku/json-models';
import { Button } from '../Button';
import { useCurrentUser } from '../currentUserStore';

export const GroupList = ({
	substring,
	filter,
}: {
	substring?: string;
	filter?: GroupFilter;
}) => {
	const user = useCurrentUser();
	const [groups, setGroups] = useState<Group[]>([]);
	const [memberships, setMemberships] = useState<GroupMembership[]>([]);
	const [queriedGroups, setQueriedGroups] = useState(false);
	useEffect(() => {
		if (queriedGroups) return;
		if (sessionId) {
			setQueriedGroups(true);
			api.listGroups({ filter, substring }).then(
				({ groups, memberships }) => {
					setGroups(groups);
					setMemberships(memberships);
				},
			);
		} else {
			setQueriedGroups(true);
			api.listGroupsUnauthenticated({ substring }).then(setGroups);
		}
	}, [queriedGroups, groups, memberships, filter, substring]);
	return groups.length ? (
		<ul>
			{groups.map(g => (
				<li>
					<h3>{g.name}</h3>
					{user &&
					memberships.find(m => m.group === g.id) &&
					g.owner !== user.id ? (
						<Button onClick={() => alert('Coming soon!')}>
							Leave
						</Button>
					) : (
						<Button onClick={() => alert('Coming soon!')}>
							Join
						</Button>
					)}
				</li>
			))}
		</ul>
	) : (
		"You're not in any groups!"
	);
};
