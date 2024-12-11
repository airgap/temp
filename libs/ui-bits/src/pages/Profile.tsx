import { BotListWithCreator } from '../BotListWithCreator';
import { Center } from '../Center';
import { ChannelListWithCreator } from '../ChannelListWithCreator';
import { Divisio } from '../Divisio';
import { ImageUpload } from '../ImageUpload';
import { phrasebook } from '../phrasebook';
import { shout } from '../Sonic';
import { MaybeUser } from '../currentUserStore';

import styles from './Profile.module.sass';

export const Profile = () => (
  <MaybeUser
    catchall={({ user }) => (
      <Center>
        <Divisio size={'m'} layout={'v'}>
          <Divisio size={'m'} layout={'h'}>
            <div className={styles.uploader}>
              <ImageUpload
                shape={'squircle'}
                reason={'ProfilePicture'}
                image={user?.profilePicture}
                onUpload={(id: string) => {
                  shout('profilePictureChanged', id);
                  window.location.reload();
                }}
              />
            </div>
            <Divisio size={'m'} layout={'v'}>
              <h1>{user?.username ?? 'User'}</h1>
              <p>{phrasebook.bioWip}</p>
            </Divisio>
          </Divisio>
          <Center>
            <h2>{phrasebook.myBots}</h2>
          </Center>
          <BotListWithCreator />
          <Center>
            <h2>{phrasebook.channelListTitle}</h2>
          </Center>
          <ChannelListWithCreator />
        </Divisio>
      </Center>
    )}
  />
);
