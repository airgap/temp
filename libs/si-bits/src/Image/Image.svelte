<script lang="ts">
  import classnames from 'classnames';
  import { formImageUrl } from '../formImageUrl';
  import styles from './Image.module.sass';
  import face from '../face.png';

  type Shape = 'circle' | 'square' | 'squircle' | 'rounded';
  
  interface $$Props extends Omit<svelte.JSX.ImgHTMLAttributes<HTMLImageElement>, 'id' | 'src'> {
    size?: 'l' | 'm' | 's' | 'full-post';
    bot?: boolean;
    shape?: Shape;
    url?: string;
    // CLOUDFLARE UPLOAD ID
    // NOOOOOOOOT HTML ID
    id?: bigint;
  }

  const { size, bot, shape, url, id, className } = $props<$$Props>();

  const src = $derived(id !== undefined 
    ? formImageUrl(id) 
    : url !== undefined 
    ? url 
    : face);
</script>

<span
  class={classnames(
    styles.Image,
    className,
    size && styles[size],
    {
      [styles.bot]: bot,
      [styles.squircle]: shape === 'squircle',
      [styles.circle]: shape === 'circle',
    }
  )}
>
  <img {src} alt="Profile" />
</span> 