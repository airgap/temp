<script lang="ts">
  import { getLevelFromPoints, getProgressToNextLevel, makeDonut } from '@lyku/helpers';
  import styles from './LevelBadge.module.sass';
	import { derived } from 'svelte/store';

  // Props
  const { points, progress = false, size = 's' } = $props<{ points: bigint; progress?: boolean; size?: 's' | 'm' | 'l' }>();
  // export let progress: boolean = false;
  // export let size: 's' | 'm' | 'l' = 's';

  const sizes = {
    s: 25,
    m: 50,
    l: 100,
  } as const;

  const sizeValue = $derived(sizes[size]);
  const half = $derived(sizeValue / 2);
  const level = $derived(getLevelFromPoints(points));
  const progressValue = $derived(getProgressToNextLevel(points));
  
  const text = $derived(`<text x='${half}' y='${half}' text-anchor='middle' dy='.375em' fill='white' font-size='${half}'>${level}</text>`);
  
  const donut = $derived((() => {
    const bg = '#ffffff55';
    const data = [{ value: 100 - progressValue }, { value: progressValue || 1 }];
    const color = progressValue ? [bg, 'white'] : [bg, 'transparent'];
    const girth = sizeValue / 8;
    const radius = (sizeValue - girth) / 2;
    
    const arr = makeDonut(half, half, radius, data);
    return arr.map((item, i) => 
      `<g><path d='${item.d}' stroke='${color[i]}' fill='none' stroke-width='${girth}' /></g>`
    ).join('');
  })());

  const html = $derived(donut + text);
</script>

<svg 
  class={styles.LevelBadge} 
  width={sizeValue} 
  height={sizeValue} >
  {@html html}
</svg>