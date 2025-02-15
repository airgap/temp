<script lang="ts">
  import classnames from 'classnames';
  import { Link } from '../Link';
  import styles from './ReactionButton.module.sass';

  export const reactionTypes = ['like', 'reply', 'echo', 'share'] as const;
  export type ReactionType = (typeof reactionTypes)[number];
  export type Orientation = 'Horizontal' | 'Vertical';
  export type PostReactionHandler = () => void;

  export let disabled: boolean | undefined = undefined;
  export let onClick: PostReactionHandler | undefined = undefined;
  export let orientation: Orientation | undefined = undefined;
  export let glyph: string;
  export let value: number | undefined = undefined;
  export let className: string | undefined = undefined;
</script>

<span
  class={classnames(
    styles.Reaction,
    {
      [styles.disabled]: disabled,
      [styles.vertical]: orientation === 'Vertical',
    },
    className
  )}
>
  <Link {disabled} {onClick}>
    <SVG src={glyph} />
  </Link>
  {#if typeof value === 'number'}
    <span class={styles.Stat}>{value}</span>
  {/if}
</span> 