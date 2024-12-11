import { Close } from '../Close';
import { PostCreator } from '../PostCreator';
import { useEffect, useState } from 'react';
import { Post } from '@lyku/json-models';
import { listen, shout } from '../Sonic';
import styles from './PostCreatorPopover.module.sass';
import { useCurrentUser } from '../currentUserStore';

export const PostCreatorPopover = () => {
  const user = useCurrentUser();
  const [echoing, setEchoing] = useState<Post>();
  useEffect(() => {
    listen('echo', setEchoing);
  }, []);
  return (
    user &&
    echoing && (
      <div className={styles.PostCreatorPopover}>
        <div>
          <Close
            onClick={() => {
              shout('echo', undefined);
            }}
          />
          <PostCreator showInset={true} user={user} echo={echoing?.id} />
        </div>
      </div>
    )
  );
};
