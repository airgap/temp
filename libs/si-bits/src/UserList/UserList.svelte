<script lang="ts">
  import type { User } from '@lyku/json-models';
  import { Image } from '../Image';
  import { formImageUrl } from '../formImageUrl';
  import { phrasebook } from '../phrasebook';
  import styles from './UserList.module.sass';

  export let users: User[] | undefined = undefined;
  export let mine: boolean | undefined = undefined;
</script>

<ul class={styles.UserList}>
  {#if users?.length}
    {#each users as user (user.id)}
      <li class={styles.userItem}>
        <a href={`/${user.username}${mine ? '/edit' : ''}`}>
          <table>
            <tbody>
              <tr>
                <td>
                  <Image
                    url={formImageUrl(user.profilePicture, 'btvprofile')}
                    size="m"
                    bot={user.bot}
                  />
                </td>
                <td>
                  <div class={styles.deets}>
                    <h3>{user.username}</h3>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </a>
      </li>
    {/each}
  {:else}
    {phrasebook.botlessLuddite}
  {/if}
  <li>
    <slot />
  </li>
</ul> 