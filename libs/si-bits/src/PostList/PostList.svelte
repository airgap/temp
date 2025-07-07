<script lang="ts">
	import type { Post, Thread } from '@lyku/json-models';
	import { postStore, userStore } from '../CacheProvider';
	import { DynamicPost } from '../DynamicPost';
	import styles from './PostList.module.sass';
	import classNames from 'classnames';
	import { onMount } from 'svelte';
	import { api } from 'monolith-ts-api';
	import Dialog from '../Dialog/Dialog.svelte';
	import Divisio from '../Divisio/Divisio.svelte';
	import { Button } from '../Button';
	import { Spinner } from '../Spinner';

	const {
		threads,
		inset = false,
		placeholder,
		cfHash,
		onneedspage,
	} = $props<{
		threads?: Thread[];
		inset?: boolean;
		placeholder?: any;
		cfHash: string;
		onneedspage?: () => void;
	}>();

	const visiblePageSize = 50;

	let visibleCount = $state(visiblePageSize);
	let postListElement: HTMLDivElement;
	let isLoading = $state(false);
	let hasRequestedNextPage = $state(false);
	let previousThreadsLength = $state(threads?.length || 0);

	// Deletion dialog states
	let confirmingDelete = $state(false);
	let notifyingDelete = $state(false);
	let deleting = $state(false);
	let postToDelete = $state<bigint | null>(null);

	const visibleThreads = $derived(threads?.slice(0, visibleCount) || []);
	const hasMore = $derived(threads && visibleCount < threads.length);

	// Reset hasRequestedNextPage when new threads are added
	$effect(() => {
		const currentLength = threads?.length || 0;
		if (currentLength > previousThreadsLength) {
			hasRequestedNextPage = false;
			previousThreadsLength = currentLength;
		}
	});

	const handleDeleteClick = (postId: bigint) => {
		postToDelete = postId;
		confirmingDelete = true;
	};

	const confirmDelete = async () => {
		if (!postToDelete) return;

		deleting = true;
		try {
			await api.deletePost(postToDelete);
			confirmingDelete = false;
			notifyingDelete = true;
		} catch (error) {
			console.error('Failed to delete post:', error);
			deleting = false;
		}
	};

	onMount(() => {
		const checkScroll = (e: Event) => {
			const target = e.target as HTMLElement;
			const scrollTop = target.scrollTop;
			const scrollHeight = target.scrollHeight;
			const clientHeight = target.clientHeight;
			const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

			if (scrollPercentage > 0.85) {
				// Handle infinite scroll within current threads
				if (hasMore && !isLoading) {
					isLoading = true;
					visibleCount += visiblePageSize;
					setTimeout(() => {
						isLoading = false;
					}, 100);
				}
				// Handle pagination - request next page
				else if (
					!hasMore &&
					onneedspage &&
					!hasRequestedNextPage &&
					!isLoading
				) {
					hasRequestedNextPage = true;
					onneedspage();
				}
			}
		};

		// Find the scrollable ancestor by looking for overflow: auto/scroll
		let scrollableParent = postListElement?.parentElement;
		while (scrollableParent) {
			const style = window.getComputedStyle(scrollableParent);
			if (
				style.overflow === 'auto' ||
				style.overflow === 'scroll' ||
				style.overflowY === 'auto' ||
				style.overflowY === 'scroll'
			) {
				break;
			}
			scrollableParent = scrollableParent.parentElement;
		}

		if (scrollableParent) {
			scrollableParent.addEventListener('scroll', checkScroll);
			return () => scrollableParent.removeEventListener('scroll', checkScroll);
		}
	});
</script>

<div
	bind:this={postListElement}
	class={classNames(styles.PostList, { [styles.inset]: inset })}
>
	{#if visibleThreads.length}
		{#each visibleThreads as thread}
			{#if thread.replyTo}
				<DynamicPost
					post={thread.replyTo}
					autoplay={false}
					{cfHash}
					ondeleteclick={handleDeleteClick}
				/>
			{/if}
			<DynamicPost
				post={thread.focus}
				autoplay={false}
				{cfHash}
				ondeleteclick={handleDeleteClick}
			/>
			{#if thread.replies}
				{#each thread.replies as reply}
					<DynamicPost
						post={reply}
						autoplay={false}
						{cfHash}
						ondeleteclick={handleDeleteClick}
					/>
				{/each}
			{/if}
		{/each}
	{:else if !threads?.length}
		{placeholder}
	{/if}
</div>

<Dialog bind:visible={confirmingDelete} title="Really delete?">
	<Divisio layout="v">
		<p></p>
		<Divisio layout="h" alignItems="end" size="l">
			<Button disabled={deleting} onClick={confirmDelete}>
				{#if deleting}
					<Spinner size="s" />
				{:else}
					Yes
				{/if}
			</Button>
			<Button disabled={deleting} onClick={() => (confirmingDelete = false)}>
				No
			</Button>
		</Divisio>
	</Divisio>
</Dialog>

<Dialog bind:visible={notifyingDelete} title="Post deleted">
	<Button
		onClick={() => {
			notifyingDelete = false;
			window.location.reload();
		}}
	>
		Begone!
	</Button>
</Dialog>
