<script lang="ts">
  import { api } from 'monolith-ts-api';
  import type { TtfMatch, User } from '@lyku/json-models';
  import { Button } from '../Button';
  import { Link } from '../Link';
  import { ProfilePicture } from '../ProfilePicture';
  import { localizeUsername } from '../localizeUsername';
  import styles from './MatchList.module.sass';
  import { Divisio } from '../Divisio';
  import { cacheStore } from '../CacheProvider';

  export let user: User;
  export let onClose: () => void;

  let matches: TtfMatch[] = [];
  let queried = false;
  let users: User[] | undefined;

  $: if (!queried) {
    queried = true;
    api.listTtfMatches({ finished: false }).then((matchList) => {
      const mine: TtfMatch[] = [];
      const theirs: TtfMatch[] = [];
      for (const match of matchList) {
        (match.whoseTurn === user.id ? mine : theirs).push(match);
      }
      matches = [...mine, ...theirs];
    });
  }

  $: {
    const userIds = matches.flatMap((m) => [m.X, m.O]);
    users = cacheStore.users.get(userIds);
  }
</script>

<div class={styles.MatchList}>
  <table>
    <thead>
    <tr>
      <td>
        <Button on:click={onClose}>&lt; Back</Button>
      </td>
    </tr></thead>
    <tbody>
    {#if matches.length}
      {#each matches as match}
        {@const mine = match.whoseTurn === user.id}
        {@const theirId = mine ? match.O : match.X}
        {@const them = users?.find((u) => u.id === theirId)}
        {#if !them}
          <tr><td>They are absent</td></tr>
        {:else}
          <tr>
            <td>
              <ProfilePicture url={user.profilePicture} />
            </td>
            <td style="vertical-align: top">
              <Divisio size="rs" layout="v">
                <table style="font-size: .8em">
                  <tbody>
                  <tr>
                    <td>You</td>
                    <td>{localizeUsername(them.username)}</td>
                  </tr>
                </tbody>
                </table>
                {#if mine}
                  <Link href={'#' + match.id} class={styles.Play}>
                    Play your turn
                  </Link>
                {:else}
                  <i style="opacity: 0.5">Their turn</i>
                {/if}
              </Divisio>
            </td>
            <td>
              <ProfilePicture url={them.profilePicture} />
            </td>
          </tr>
        {/if}
      {/each}
    {:else}
      <i style="opacity: 0.5; margin-top: 31%; display: block">
        Active matches will appear here
      </i>
    {/if}</tbody>
  </table>
</div> 