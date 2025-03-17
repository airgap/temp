<script lang="ts">
	import classnames from 'classnames';
	import bannerStyles from './Banner.module.sass';

	// No need to explicitly declare children - it's a built-in prop
	let { children } = $props();
</script>

<div class={classnames(bannerStyles.Banner)}>
	<h1>{@render children?.()}</h1>
</div>
