<script lang="ts">
  import { Link } from '../Link';
  import styles from './MobileNavLink.module.sass';

  export let href: string | undefined = undefined;
</script>

<Link
  {href}
  class={href && window.location.pathname.startsWith(href) ? styles.depressed : ''}
  on:click
>
  <slot />
</Link> 