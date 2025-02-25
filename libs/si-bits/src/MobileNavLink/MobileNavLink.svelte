<script lang="ts">
  import { Link } from '../Link';
  import styles from './MobileNavLink.module.sass';
  const { href, isActive, children } = $props<{ href: string | undefined; isActive: boolean; children: [] }>();
</script>

<Link
  {href}
  class={isActive ? styles.depressed : ''}
  on:click
>
  {@render children?.()}
</Link> 