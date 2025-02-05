<script lang="ts">
  import styles from './MatchInfo.module.sass';
  import { api } from 'monolith-ts-api';
  import type { TtfMatch, User } from '@lyku/json-models';
  import { localizeUsername } from '../localizeUsername';

  export let match: TtfMatch | undefined = undefined;
  export let user: User | undefined = undefined;

  let xUser: User | undefined;
  let oUser: User | undefined;
  let tried = false;

  $: xTurn = match?.turn && match.turn % 2;
  $: oTurn = match?.turn && match.turn % 2 === 0;

  $: if (match && !tried) {
    tried = true;
    api.getUsers([match.X, match.O])
      .then(([x, o]) => {
        xUser = x;
        oUser = o;
      })
      .catch(console.error);
  }
</script>

<div class={styles.MatchInfo}>
  <div class={`${styles.x} ${xTurn ? styles.myTurn : ''}`}>
    {localizeUsername(xUser?.username)}
  </div>
  <div class={styles.vs}>vs</div>
  <div class={`${styles.o} ${oTurn ? styles.myTurn : ''}`}>
    {localizeUsername(oUser?.username)}
  </div>
</div> 