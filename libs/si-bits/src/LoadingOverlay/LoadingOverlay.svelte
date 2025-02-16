<script lang="ts">
  import Loading from './Loading.svelte';
  import h from '../hidden.module.sass';
  import styles from './LoadingOverlay.module.sass';
	import classNames from 'classnames';
  
  export let visible: boolean = false;
</script>

<div class={classNames(styles.LoadingOverlay, {
  [h.hidden]: !visible
})}>
  <Loading />
</div>