import { TtfMatch, User } from '@lyku/json-models';
import { Link } from './Link';

export const WinPanel = ({ user, match }: { user?: User; match: TtfMatch }) => (
  <>
    {user?.id === match.winner ? (
      <>
        <h1>You won!</h1>
        {!user?.id && <h3>Make an account to earn points when you win!</h3>}
      </>
    ) : (
      <h1>You lost.</h1>
    )}
    <Link href={'#'}>Play again</Link>
  </>
);
