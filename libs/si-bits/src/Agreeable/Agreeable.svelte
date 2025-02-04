<script lang="ts">
  import styles from './Agreeable.module.sass';


  let { onChange, slots } = $props<{
    onChange?: (agreed: boolean) => void | boolean;
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
    oninput={(e) => onChange?.(e.currentTarget.checked)}
  />
  <label {id}>
    {@render slots.default?.()}
  </label>
</div> 