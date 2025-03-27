<script lang="ts">
	import type { Post } from '@lyku/json-models';
	import { DynamicPost } from '../DynamicPost';
	import styles from './PostList.module.sass';
	import classNames from 'classnames';

	const {
		posts,
		inset = false,
		placeholder,
		cfAccountId,
	} = $props<{
		posts: Post[];
		inset?: boolean;
		placeholder?: any;
		cfAccountId: string;
	}>();
</script>

<div class={classNames(styles.PostList, { [styles.inset]: inset })}>
	{#if posts?.length}
		{#each posts as post (post.id)}
			<DynamicPost {post} autoplay={false} {cfAccountId} />
		{/each}
	{:else}
		{placeholder}
	{/if}
</div>
