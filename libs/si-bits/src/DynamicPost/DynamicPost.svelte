<script lang="ts">
	import classnames from 'classnames';
	import { api } from 'monolith-ts-api';
	import { Stream } from '@cloudflare/stream-react';
	import type { Post, User } from '@lyku/json-models';
	import { AttachmentType } from '@lyku/helpers';
	import { ComingSoon } from '../ComingSoon';
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
	import {
		myFriendshipStore,
		myFolloweeStore,
		// useUser,
		// useFollow,
		// useFriendship,
		userStore,
		postStore,
	} from '../CacheProvider';
	import { PostCreator } from '../PostCreator';
	import { DotDotDot } from '../DotDotDot';
	import { LikeButton } from '../LikeButton';
	import { EchoButton } from '../EchoButton';
	import { ReplyButton } from '../ReplyButton';
	import { ShareButton } from '../ShareButton';
	import styles from './DynamicPost.module.sass';
	// import { useCacheData } from '../CacheProvider';

	const insets = { reply: styles.replied, echo: styles.echoed } as const;

	const {
		post: id,
		inset = false,
		showReplies = false,
		autoplay = false,
		// author = undefined
		cfHash,
	} = $props<{
		post: bigint;
		inset?: keyof typeof insets | false;
		showReplies?: boolean;
		autoplay?: boolean;
		// author?: User | undefined;
		cfHash: string;
	}>();

	console.log('ffffudge');

	const post = $derived(postStore.get(id));

	let replies = $state<Post[]>([]);
	let queriedReplies = $state(false);
	let error = $state<string>();
	let showReplyer = $state(false);
	let dropped = $state(false);
	let bgx = $state(0);
	let bgy = $state(0);
	const urlRegex =
		/(?:(?:http|ftp|https):\/\/)?(?:[\w-]+(?:(?:\.[\w-]+)+))(?::\d{2,5})?[^ "]*/g;
	const stripLink = (url: string) =>
		url.split(/:\/\//)[1].replace(/:[0-9]{2,5}/, '');
	const stripLinks = (body: string) =>
		body.replace(urlRegex, (url) => `<a href='${url}'>${stripLink(url)}</a>`);
	$inspect(userStore);
	console.log('fffa');
	// $effect(() => console.log('bbb', userStore));
	const author = $derived(userStore.get(post?.author));
	const follow = myFolloweeStore.get(author?.id);
	console.log('anal beads', post?.author, author);
	// const follow = $derived(followStore.get($post?.author));
	const friendship = myFriendshipStore.get(post?.author);
	let adderDropped = $state(false);
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

	$effect(() => error && console.error('DynamicPost error:', error?.message));

	$inspect('hnng', userStore.get(-1n), showReplyer);

	$effect(() => {
		console.log('AUTHOR ID', post?.author);
		console.log('AUTHOR', author);
	});

	$effect(() => {
		if (!queriedReplies && post?.replies) {
			queriedReplies = true;
			api.listPostReplies({ id: post.id }).then((posts) => (replies = posts));
		}
	});

	const handleDelete = (e: Event) => {
		e.preventDefault();
		if (window.confirm('Really delete?')) {
			api.deletePost(post.id).then(() => {
				window.alert('Post deleted.');
				window.location.reload();
			});
		}
	};
	const itsYou = $derived(
		userStore.get(-1n) && author?.id === userStore.get(-1n)?.id,
	);
	$inspect(author);
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
		<Link class={styles.username} href="/u/{author?.username}">
			{author?.username}
		</Link>
		&middot;
		<span class={[styles.inlineDropper, adderDropped && styles.dropped]}>
			<button
				class={styles.dropperBackdrop}
				onclick={() => (adderDropped = false)}
				aria-label="Close"
				style={`--bgx: ${bgx}px; --bgy: ${bgy}px`}
			></button>
			<Button
				onClick={(e) => {
					adderDropped = !adderDropped;
					if (adderDropped) {
						bgx = e.clientX;
						bgy = e.clientY;
					}
				}}
			>
				{#if itsYou}
					you
				{:else if friendship === 'befriended'}
					friend
				{:else if friendship === 'theyOffered'}
					wants to be your friend
				{:else if follow}
					followed
				{:else}
					add
				{/if}
			</Button>
			<div class={styles.dropperMenu} style="--width: 230px">
				<ul>
					{#if itsYou}
						<li>
							<Button
								onClick={() => (window.location = `/u/${author?.username}`)}
								>Edit profile</Button
							>
						</li>
					{/if}
					{#if follow}
						<li>
							<Button comingSoon onClick={() => alert('WIP')}
								>Invite to group</Button
							>
						</li>
					{:else if !itsYou}
						<li>
							<Button
								onClick={() => {
									followStore.set(post.author, true);
									api.followUser(post.author);
								}}>Follow</Button
							>
						</li>
					{/if}
					{#if friendship === 'befriended'}
						<li>
							<Button comingSoon onClick={() => alert('WIP')}
								>Invite to game</Button
							>
						</li>
					{:else if friendship === 'none' && !itsYou}
						<li>
							<Button
								onClick={() => {
									myFriendshipStore.set(post.author, 'youOffered');
									api.createFriendRequest(post.author);
								}}>Add friend</Button
							>
						</li>
					{:else if friendship === 'youOffered'}
						<li>
							<Button
								onClick={() => {
									myFriendshipStore.set(post.author, 'none');
									api.recindFriendRequest(post.author);
								}}>Recind friendship offer</Button
							>
						</li>
					{:else if friendship === 'theyOffered'}
						<li>
							<Button
								onClick={() => {
									myFriendshipStore.set(post.author, 'befriended');
									api.acceptFriendRequest(post.author);
								}}>Accept friend request</Button
							>
						</li>
						<li>
							<Button
								onClick={() => {
									myFriendshipStore.update(post.author, 'none');
									api.declineFriendRequest(post.author);
								}}>Ignore friend request</Button
							>
						</li>
					{/if}
					{#if follow}
						<li>
							<Button
								destructive={true}
								onClick={() => {
									myFollowStore.set(post.author, false);
									api.unfollowUser(post.author);
								}}>Unfollow</Button
							>
						</li>
					{/if}
					{#if friendship === 'befriended'}
						<li>
							<Button
								destructive={true}
								onClick={() => {
									myFriendshipStore.set(post.author, 'none');
									api.deleteFriendship(post.author);
								}}>Remove friend</Button
							>
						</li>
					{/if}
				</ul>
			</div>
		</span>
		&middot;
		<DynamicDate time={post?.publish} />

		<span class={styles.PostContent}>
			{#if post?.title}
				<h1>{post.title}</h1>
			{/if}
		</span>

		{#if post?.body}
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

	{#if post && 'attachments' in post}
		<div
			class={[
				styles.attachments,
				post.attachments.length &&
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
						onclick={() =>
							window.dispatchEvent(new CustomEvent('light', { detail: at }))}
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
			<ReplyButton {post} />
			<ShareButton {post} />
		</span>

		{#if showReplyer && userStore.get(-1n) && post}
			<br />
			<PostCreator
				showInset={false}
				reply={post.id}
				user={userStore.get(-1n)}
			/>
		{/if}
	{/if}

	{#if showReplies && replies.length > 0}
		<div class={styles.sep}></div>
		<PostList posts={replies} inset={1} cfAccountId={cfHash} />
	{/if}
	<span class={[styles.dropper, dropped && styles.dropped]}>
		<button
			class={styles.dropperBackdrop}
			onclick={() => (dropped = false)}
			aria-label="Close"
			style={`--bgx: ${bgx}px; --bgy: ${bgy}px`}
		></button>
		<DotDotDot
			onClick={(e) => {
				dropped = !dropped;
				if (dropped) {
					bgx = e.clientX;
					bgy = e.clientY;
				}
			}}
			{dropped}
		/>
		<div class={styles.dropperMenu} style="--width: 200px">
			<ul>
				<!-- <li><Button>Edit</Button></li> -->
				<li><Button comingSoon onClick={() => alert('WIP')}>Share</Button></li>
				{#if itsYou}
					<li><Button destructive onClick={handleDelete}>Delete</Button></li>
				{/if}
			</ul>
		</div>
	</span>
</span>
