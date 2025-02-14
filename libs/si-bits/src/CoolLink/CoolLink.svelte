<script lang="ts">
  import Link from '../Link/Link.svelte';
  import classNames from 'classnames';
  import styles from './CoolLink.module.sass';
  
  // Export all props that can be passed to the Link component
  export let href: string | undefined = undefined;
  export let className: string | undefined = undefined;
  export let style: string | undefined = undefined;
  export let isActive: boolean = false; // New prop to control the active state
  // ... export other props as needed
  
  $: classes = classNames(styles.CoolLink, {
    [styles.depressed]: isActive
  }, className);
</script>

<Link
  {...$$restProps}
  {href}
  className={classes}
  {style}
>
  <slot />
</Link>