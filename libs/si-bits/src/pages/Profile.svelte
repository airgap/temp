<script lang="ts">
  import { BotListWithCreator } from '../BotListWithCreator';
  import { Center } from '../Center';
  import { ChannelListWithCreator } from '../ChannelListWithCreator';
  import { Divisio } from '../Divisio';
  import { ImageUpload } from '../ImageUpload';
  import { phrasebook } from '../phrasebook';
  import { shout } from '../Sonic';
  import { currentUser } from '../currentUserStore';
  
  import styles from './Profile.module.sass';

  function handleUpload(id: string) {
    shout('profilePictureChanged', id);
    window.location.reload();
  }
</script>

{#if $currentUser}
  <Center>
    <Divisio size="m" layout="v">
      <Divisio size="m" layout="h">
        <div class={styles.uploader}>
          <ImageUpload
            shape="squircle"
            reason="ProfilePicture"
            image={$currentUser.profilePicture}
            onUpload={handleUpload}
          />
        </div>
        <Divisio size="m" layout="v">
          <h1>{$currentUser.username ?? 'User'}</h1>
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
{/if} 