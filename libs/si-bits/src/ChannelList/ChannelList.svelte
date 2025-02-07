<script lang="ts">
  import { formImageUrl } from '../formImageUrl';
  import { phrasebook } from '../phrasebook';
  import styles from './ChannelList.module.sass';
  import type { Channel } from '@lyku/json-models';

  export let channels: Channel[] | undefined = undefined;
  export let mine: boolean = false;
</script>

<ul class={styles.ChannelList}>
  {#if channels}
    {#each channels as channel (channel.id)}
      <li class={styles.channelItem}>
        <a href="/{channel.name}{mine ? '/edit' : ''}">
          <table>
            <tbody>
              <tr>
                <td>
                  <img
                    src={formImageUrl(channel.logo, 'btvprofile')}
                    alt="Channel logo"
                    class={styles.channelLogo}
                  />
                </td>
                <td>
                  <div class={styles.deets}>
                    <h3>{channel.name}</h3>
                    <p>{channel.tagline || phrasebook.taglineMissing}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </a>
      </li>
    {/each}
  {/if}
  {#if $$slots.default}
    <li><slot /></li>
  {/if}
</ul> 