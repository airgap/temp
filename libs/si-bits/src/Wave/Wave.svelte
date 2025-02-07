<script lang="ts">
  import wave from '../assets/wave.svg';
  import styles from './Wave.module.sass';
  export let turn: number;
</script>

<div 
  class={styles.Wave}
  style="top: {(2 - ((turn - 1) % 3)) * 33.33}%"
>
  <img src={wave} alt="drop in {3 - (turn % 3)}" />
</div> 