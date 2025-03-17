<script lang="ts">
	import type { Post } from '@lyku/json-models';
	import { DynamicPost } from '../DynamicPost';
	import styles from './PostList.module.sass';
	import classNames from 'classnames';

	const {
		posts,
		inset = false,
		placeholder,
	} = $props<{ posts: Post[]; inset?: boolean; placeholder?: any }>();
</script>

<div class={classNames(styles.PostList, { [styles.inset]: inset })}>
	{#if posts?.length}
		{#each posts as post (post.id)}
			<DynamicPost {post} autoplay={false} />
		{/each}
	{:else}
		{placeholder}
	{/if}
</div>
