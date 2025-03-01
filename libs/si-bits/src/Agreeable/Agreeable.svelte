<script lang="ts">
  import styles from './Agreeable.module.sass';
  import { phrasebook } from '../phrasebook';
  import {ShowTos} from '../ShowTos';

  let { children, oninput, onshowtos } = $props<{
    children: ComponentType[]
    oninput: (checked: boolean) => void
  }>();

  let id = Math.random().toString().substring(2);
</script>

<div class={styles.Agreeable}>
  <input
    type="checkbox"
    {id}
    oninput={oninput}
  />
  <label {id}>
    {phrasebook.termsLabel}
  </label>
  <ShowTos onclick={onshowtos}>{phrasebook.termsLink}</ShowTos>
</div>
