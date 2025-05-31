<script lang="ts">
	import type { Post, Thread } from '@lyku/json-models';
	import { postStore } from '../CacheProvider';
	import { DynamicPost } from '../DynamicPost';
	import styles from './PostList.module.sass';
	import classNames from 'classnames';

	const {
		threads,
		inset = false,
		placeholder,
		cfHash,
	} = $props<{
		threads?: Thread[];
		inset?: boolean;
		placeholder?: any;
		cfHash: string;
	}>();
</script>

<div class={classNames(styles.PostList, { [styles.inset]: inset })}>
	{#if threads?.length}
		{#each threads as thread}
			{#if thread.replyTo}
				<DynamicPost post={thread.replyTo} autoplay={false} {cfHash} />
			{/if}
			<DynamicPost post={thread.focus} autoplay={false} {cfHash} />
			{#if thread.replies}
				{#each thread.replies as reply}
					<DynamicPost post={reply} autoplay={false} {cfHash} />
				{/each}
			{/if}
		{/each}
	{:else}
		{placeholder}
	{/if}
</div>
