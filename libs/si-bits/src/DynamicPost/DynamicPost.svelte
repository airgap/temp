<script lang="ts">
	import classnames from 'classnames';
	import { api } from 'monolith-ts-api';
	import { Stream } from '@cloudflare/stream-react';
	import type { Post, User } from '@lyku/json-models';
	import { AttachmentType } from '@lyku/helpers';
	import {
		getSupertypeFromAttachmentId,
		parseAttachmentId,
	} from '@lyku/helpers';

	import { Button } from '../Button';
	import { Crosshatch } from '../Crosshatch';
	import { DynamicDate } from '../DynamicDate';
	import { Image } from '../Image';
	import { Link } from '../Link';
	import { PostList } from '../PostList';
	import { ProfilePicture } from '../ProfilePicture';
	import { formImageUrl } from '../formImageUrl';
	import { cacheStore } from '../CacheProvider/CacheStore';
	import { useUser } from '../CacheProvider';
	import { PostCreator } from '../PostCreator';
	// import { useCurrentUser } from '../currentUserStore';
	import { LikeButton } from '../LikeButton';
	import { EchoButton } from '../EchoButton';
	import { ReplyButton } from '../ReplyButton';
	import { ShareButton } from '../ShareButton';
	import styles from './DynamicPost.module.sass';
	// import { useCacheData } from '../CacheProvider';

	const insets = { reply: styles.replied, echo: styles.echoed } as const;

	const {
		post,
		inset = false,
		showReplies = false,
		autoplay = false,
		// author = undefined
		cfHash,
	} = $props<{
		post: Post;
		inset?: keyof typeof insets | false;
		showReplies?: boolean;
		autoplay?: boolean;
		// author?: User | undefined;
		cfHash: string;
	}>();

	let replies = $state<Post[]>([]);
	let queriedReplies = $state(false);
	let error = $state<string>();
	let showReplyer = $state(false);
	let me = cacheStore.currentUser;

	const urlRegex =
		/(?:(?:http|ftp|https):\/\/)?(?:[\w-]+(?:(?:\.[\w-]+)+))(?::\d{2,5})?[^ "]*/g;
	const stripLink = (url: string) =>
		url.split(/:\/\//)[1].replace(/:[0-9]{2,5}/, '');
	const stripLinks = (body: string) =>
		body.replace(urlRegex, (url) => `<a href='${url}'>${stripLink(url)}</a>`);

	const author = $derived(useUser(post.author));
	// const [imageIds, videoIds, audioIds, documentIds] =
	//     $derived(post.attachments?.reduce((acc, id) => {
	//       const { supertype } = parseAttachmentId(id);
	//       if (!acc[supertype]) acc[supertype] = [];
	//       acc[supertype].push(id);
	//       return acc;
	//     }, [] as bigint[][]) ?? []);

	// const [images] = [[]]; //useCacheData('images', imageIds);
	// const [videos] = [[]]; //useCacheData('videos', videoIds);
	// const [audios] = [[]]; //useCacheData('audios', audioIds);
	// const [documents] = [[]]; //useCacheData('documents', documentIds);

	$effect(() => error && console.error(error));

	$effect(() => {
		if (!queriedReplies && post.replies) {
			queriedReplies = true;
			api.listPostReplies({ id: post.id }).then((posts) => (replies = posts));
		}
	});

	const handleDelete = (e: Event) => {
		e.preventDefault();
		if (window.confirm('Really delete?')) {
			api.deletePost(post.id).then(() => {
				window.alert('ViewPost deleted');
				window.location.reload();
			});
		}
	};

	$effect(() => {
		console.log('id', cfHash, 'attachments', post.attachments);
	});
</script>

<span class={classnames(styles.DynamicPost, inset && insets[inset])}>
	{#if inset === 'echo'}
		<span class={styles.hatchInset}>
			<Crosshatch width="20px" height="100%" />
		</span>
	{/if}

	<span class={styles.pp}>
		<ProfilePicture
			size="m"
			src={author?.profilePicture && formImageUrl(author?.profilePicture)}
		/>
	</span>

	<span class={styles.text}>
		<Link class={styles.username} href={`/u/${author.username}`}>
			{$author?.username}
		</Link>
		<DynamicDate time={post.publish} />
		{#if $cacheStore.currentUser && $cacheStore.currentUser.id === $author.id}
			<Button class={styles.delete} onclick={handleDelete}>X</Button>
		{/if}

		<span class={styles.PostContent}>
			{#if post.title}
				<h1>{post.title}</h1>
			{/if}
		</span>

		{#if post.body}
			<div
				class={[
					styles.body,
					{
						[styles.brief]: post.body.length < 100,
					},
				]}
			>
				{@html post.body}
			</div>
		{/if}
	</span>

	{#if 'attachments' in post}
		<div
			class={[
				styles.attachments,
				post.attachments?.length &&
					[
						styles.one,
						styles.two,
						styles.three,
						styles.four,
						styles.five,
						styles.six,
						styles.seven,
						styles.eight,
						styles.nine,
						styles.ten,
					][post.attachments.length - 1],
			]}
		>
			{#each post.attachments || [] as at}
				{#if getSupertypeFromAttachmentId(at) === AttachmentType.Image}
					<Image
						src={`https://imagedelivery.net/${cfHash}/${at.toString()}/btvprofile`}
						size="full-post"
					/>
				{:else if getSupertypeFromAttachmentId(at) === AttachmentType.Video}
					<Stream
						src={videos?.find((v) => v.id === at)?.id.toString()}
						controls={true}
						{autoplay}
						onabort={() => (error = 'Video failed to load')}
					/>
				{/if}
			{/each}
		</div>
	{/if}

	{#if !inset}
		<span class={styles.PostStats}>
			<LikeButton {post} />
			<EchoButton {post} />
			<ReplyButton onclick={() => (showReplyer = !showReplyer)} />
			<ShareButton {post} />
		</span>

		{#if showReplyer && me}
			<br />
			<PostCreator showInset={false} reply={post.id} user={me} />
		{/if}
	{/if}

	{#if showReplies && replies.length > 0}
		<div class={styles.sep}></div>
		<PostList posts={replies} inset={1} cfAccountId={cfHash} />
	{/if}
</span>
