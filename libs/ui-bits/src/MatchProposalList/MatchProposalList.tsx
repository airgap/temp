import { api } from 'monolith-ts-api';
import { useEffect, useState } from 'react';
import { MatchProposal, User } from '@lyku/json-models';
import { Button } from '../Button';
import { Link } from '../Link';
import { ProfilePicture } from '../ProfilePicture';
import { localizeUsername } from '../localizeUsername';
import styles from './MatchProposalList.module.sass';
import { Divisio } from '../Divisio';

export const MatchProposalList = ({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) => {
  const [proposals, setProposals] = useState<MatchProposal[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});

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
        {proposals.length ? (
          proposals.map((proposal) => {
            const toMe = proposal.to === user.id;
            const them = users[toMe ? proposal.from : proposal.to];
            if (!them) return toMe ? proposal.from : proposal.to;
            return (
              <tr>
                <td>
                  <ProfilePicture
                    id={toMe ? them.profilePicture : user.profilePicture}
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
                    id={toMe ? user.profilePicture : them.profilePicture}
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
