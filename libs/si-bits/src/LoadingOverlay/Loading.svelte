<script lang="ts">
  import styles from './Loading.module.sass';
  export let floating: boolean = false;
  export let visible: boolean = true;
  export let reverse: boolean = false;
  export let speed: number | undefined = undefined;

  $: speedClass = speed && speed >= 10 ? `s${Math.floor(speed / 10)}0` : '';
</script>

<div
  class={styles.Loading}
  class:floating
  class:visible
  class:reverse
  class:{styles.s10}={speedClass === 's10'}
  class:{styles.s20}={speedClass === 's20'}
  class:{styles.s30}={speedClass === 's30'}
  class:{styles.s40}={speedClass === 's40'}
  class:{styles.s50}={speedClass === 's50'}
  class:{styles.s60}={speedClass === 's60'}
  class:{styles.s70}={speedClass === 's70'}
  class:{styles.s80}={speedClass === 's80'}
  class:{styles.s90}={speedClass === 's90'}
>
  <div>
    <div>
      <div></div>
    </div>
  </div>
</div>