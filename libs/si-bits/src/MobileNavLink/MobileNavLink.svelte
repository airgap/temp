<script lang="ts">
  import { Link } from '../Link';
  import styles from './MobileNavLink.module.sass';
  const { href, isActive } = $props<{ href: string | undefined; isActive: boolean }>();
</script>

<Link
  {href}
  class={isActive ? styles.depressed : ''}
  on:click
>
  {children}
</Link> 