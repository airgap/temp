<script lang="ts">
  import { getLevelFromPoints, getProgressToNextLevel } from '@lyku/helpers';
  import styles from './LevelBadge.module.sass';

  // Props
  export let points: bigint;
  // export let progress: boolean = false;
  export let size: 's' | 'm' | 'l' = 's';

  const sizes = {
    s: 25,
    m: 50,
    l: 100,
  } as const;

  // Helper functions
  function arcradius(cx: number, cy: number, radius: number, degrees: number) {
    const radians = ((degrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + radius * Math.cos(radians),
      y: cy + radius * Math.sin(radians),
    };
  }

  const cfloor = (decimals = 0) => {
    const imprecision = Math.pow(10, decimals);
    return (n: number) => Math.floor(n * imprecision) / imprecision;
  };

  function Donut(cx: number, cy: number, radius: number, data: { value: number }[]) {
    const floor = cfloor(4);
    const f2 = cfloor(2);
    let total = 0;
    const arr = [];
    let beg = 0;
    let end = 0;
    let count = 0;

    for (let i = 0; i < data.length; i++) total += data[i].value;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      let p = f2(((item.value + 1) / total) * 100);
      count += p;

      if (i === data.length - 1 && count < 100) p = p + (100 - count);
      end = beg + (360 / 100) * p;

      const b = arcradius(cx, cy, radius, end);
      const e = arcradius(cx, cy, radius, beg);
      const la = end - beg <= 180 ? 0 : 1;

      arr.push({
        index: i,
        value: item.value,
        data: item,
        d: [
          'M',
          floor(b.x),
          floor(b.y),
          'A',
          radius,
          radius,
          0,
          la,
          0,
          floor(e.x),
          floor(e.y),
        ].join(' '),
      });
      beg = end;
    }

    return arr;
  }

  // Reactive declarations
  $: sizeValue = sizes[size];
  $: half = sizeValue / 2;
  $: level = getLevelFromPoints(points);
  $: progressValue = getProgressToNextLevel(points);
  
  $: text = `<text x='${half}' y='${half}' text-anchor='middle' dy='.375em' fill='white' font-size='${half}'>${level}</text>`;
  
  $: donut = (() => {
    const bg = '#ffffff55';
    const data = [{ value: 100 - progressValue }, { value: progressValue || 1 }];
    const color = progressValue ? [bg, 'white'] : [bg, 'transparent'];
    const girth = sizeValue / 8;
    const radius = (sizeValue - girth) / 2;
    
    const arr = Donut(half, half, radius, data);
    return arr.map((item, i) => 
      `<g><path d='${item.d}' stroke='${color[i]}' fill='none' stroke-width='${girth}' /></g>`
    ).join('');
  })();

  $: html = donut + text;
</script>

<svg 
  class={styles.LevelBadge} 
  width={sizeValue} 
  height={sizeValue} >
  {@html html}
</svg>