<script lang="ts">
  import { api } from 'monolith-ts-api';
  import type { MatchProposal, User } from '@lyku/json-models';
  import { Button } from '../Button';
  import { Link } from '../Link';
  import { ProfilePicture } from '../ProfilePicture';
  import { localizeUsername } from '../localizeUsername';
  import styles from './MatchProposalList.module.sass';
  import { Divisio } from '../Divisio';
  import { cacheStore } from '../CacheProvider';

  const { user, onClose } = $props<{ user: User; onClose: () => void }>();

  let proposals: MatchProposal[] = [];
  let queried = false;

  $effect(() => {
    if (!queried) {
      queried = true;
      api.listMatchProposals({}).then(({ proposals: proposalList }) => {
        const mine: MatchProposal[] = [];
        const theirs: MatchProposal[] = [];
        for (const proposal of proposalList) {
        (proposal.to === user.id ? mine : theirs).push(proposal);
      }
      proposals = [...mine, ...theirs];
    });
  }});

  const userList = $derived([...new Set(proposals.map((p) => p.from).concat(proposals.map((p) => p.to)))]);
  const users = $derived(cacheStore.users.get(userList));
</script>

<div class={styles.MatchList}>
  <table>
    <thead>
    <tr>
      <td>
        <Button onclick={onClose}>&lt; Back</Button>
      </td>
    </tr></thead>
    <tbody>
    {#if proposals.length}
      {#each proposals as proposal}
        {@const toMe = proposal.to === user.id}
        {@const theirId = toMe ? proposal.from : proposal.to}
        {@const them = users?.find((u) => u.id === theirId)}
        {#if !them}
          <tr><td>They are absent</td></tr>
        {:else}
          <tr>
            <td>
              <ProfilePicture src={toMe ? them.profilePicture : user.profilePicture} />
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
                {#if toMe}
                  <Divisio size="m" layout="h">
                    <Link href={'#' + proposal.id} class={styles.Play}>
                      Accept
                    </Link>
                    <Link href={'#' + proposal.id} class={styles.Play}>
                      Ignore
                    </Link>
                  </Divisio>
                {/if}
              </Divisio>
            </td>
            <td>
              <ProfilePicture src={toMe ? user.profilePicture : them.profilePicture} />
            </td>
          </tr>
        {/if}
      {/each}
    {:else}
      <tr><td colspan="99"><i style="opacity: 0.5; margin-top: 31%; display: block">
        Invites from friends will appear here
      </i></td></tr>
    {/if}</tbody>
  </table>
</div> 