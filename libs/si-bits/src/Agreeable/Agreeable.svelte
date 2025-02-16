<script lang="ts">
  import styles from './Agreeable.module.sass';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();


  let { slots } = $props<{
    slots: {
      default?: () => any;
    }
  }>();
  
  let id = Math.random().toString().substring(2);
</script>

<div class={styles.Agreeable}>
  <input
    type="checkbox"
    {id}
    oninput={e => dispatch('input', e.currentTarget.checked)}
  />
  <label {id}>
    {@render slots?.default?.()}
  </label>
</div> 