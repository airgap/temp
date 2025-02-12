<script lang="ts">
  import { Link } from '../Link';
  import styles from './MobileNavLink.module.sass';
  export let href: string | undefined = undefined;
  export let isActive: boolean = false;
</script>

<Link
  {href}
  class={isActive ? styles.depressed : ''}
  on:click
>
  <slot />
</Link> 