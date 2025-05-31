<script lang="ts">
	// import { default as Editor } from '@tinymce/tinymce-svelte';
	import { safeTags } from '@lyku/helpers';
	import { api } from 'monolith-ts-api';
	import { Tippy } from '../Tippy';
	import type {
		AttachmentMime,
		User,
		ImageDraft,
		VideoDraft,
	} from '@lyku/json-models';

	import { Button } from '../Button';
	import { Crosshatch } from '../Crosshatch';
	import { DynamicPost } from '../DynamicPost';
	import dynaPost from '../DynamicPost/DynamicPost.module.sass';
	import { ImageUpload, defaultImages } from '../ImageUpload';
	import { Link } from '../Link';
	import { ProfilePicture } from '../ProfilePicture';
	import { UploadButton } from '../UploadButton';
	import chevvy from '../assets/chevvy.svg?raw';
	import { phrasebook } from '../phrasebook';
	import styles from './PostCreator.module.sass';
	import classnames from 'classnames';
	import { bigintToBase58 } from '@lyku/helpers';
	import { userStore } from '../CacheProvider';

	const {
		reply = undefined,
		echo = undefined,
		showInset = undefined,
		onsuccess = undefined,
	} = $props<{
		reply?: bigint;
		echo?: bigint;
		showInset?: boolean;
		onsuccess?: () => void;
	}>();

	let {
		id,
		body,
		error,
		files,
		imageDrafts,
		videoDrafts,
		pending,
		finalizing,
	} = $state({
		id: undefined as bigint | undefined,
		body: '',
		error: undefined as string | undefined,
		files: [] as File[],
		imageDrafts: undefined as ImageDraft[] | undefined,
		videoDrafts: undefined as VideoDraft[] | undefined,
		pending: 0,
		finalizing: false,
	});

	const submitText = $derived(() => {
		return echo ? phrasebook.echo : reply ? phrasebook.reply : phrasebook.post;
	});

	function clear() {
		id = undefined;
		body = '';
		error = undefined;
		// postable = false;
		files = [];
		imageDrafts = [];
		videoDrafts = [];
		pending = 0;
		finalizing = false;
	}

	$effect(() => {
		if (!pending && !finalizing && id) {
			console.log('Finalizing post', id);
			finalizing = true;
			api.finalizePost({ id }).then((res) => {
				window.location.pathname = `/${bigintToBase58(id)}`;
				console.info('ViewPost finalization:', res);
				finalizing = false;
				clear();
				onsuccess?.();
			});
		}
	});

	const postable = $derived(() => {
		return (files.length || body?.length > 0) && !error;
	});

	async function post() {
		console.log('submitting', body, 'with', files);
		pending = files.length;
		const result = await api.draftPost({
			...(body.trim().length ? { body } : {}),
			attachments: files.map(({ name, type, size }) => ({
				filename: name,
				type,
				size,
			})),
			replyTo: reply?.id,
			echoing: echo?.id,
			d: void 0,
		});

		if (!result.id) {
			error = result.error ?? phrasebook.unknownFrontendError;
			return;
		}

		id = result.id;
		imageDrafts = result.imageDrafts;
		videoDrafts = result.videoDrafts;
		console.log(
			'Draft post submitted successfully.',
			imageDrafts ?? 'No images',
			videoDrafts ?? 'No videos',
		);
	}

	function depend() {
		pending -= 1;
	}

	const placeholder = $derived(() => {
		return echo
			? phrasebook.postBodyEchoPlaceholder
			: reply
				? phrasebook.postBodyReplyPlaceholder
				: phrasebook.postBodyStandardPlaceholder;
	});

	function handleFileChange(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		if (target.files) {
			files = [...files, ...Array.from(target.files)];
		}
	}
	const user = $derived(userStore.get(-1n));
</script>

<div class={styles.PostCreator}>
	{#if showInset && reply}
		<DynamicPost post={reply} inset="reply" />
	{/if}

	<div class={classnames({ [styles.newPost]: reply })}>
		{#if reply}
			<span class={dynaPost.hatchInset}>
				<Crosshatch width="20px" height="100%" />
			</span>
		{/if}

		<div class={styles.UserDetails}>
			<ProfilePicture
				src={user?.profilePicture ?? defaultImages.ProfilePicture}
				size="m"
			/>
			<Link class={styles.Username}>{user?.username}</Link>
		</div>

		<div class={styles.editBox}>
			<UploadButton onchange={handleFileChange} />
			<span class={styles.editor}>
				<Tippy value={body} oninput={(newVal) => (body = newVal)} />
			</span>
		</div>

		<div class={styles.imageList}>
			{#each files as file, f}
				{@const pack =
					imageDrafts?.find((d) => d.filename === file.name) ??
					videoDrafts?.find((d) => d.filename === file.name)}
				<ImageUpload
					key={file.name}
					reason="PostAttachment"
					{file}
					working={Boolean(pending) || Boolean(pack)}
					removeClicked={pending
						? undefined
						: () => (files = [...files.slice(0, f), ...files.slice(f + 1)])}
					attachmentUploadPack={pack}
					onUpload={depend}
					allowVideo={true}
				/>
			{/each}
		</div>

		<div class={styles.Submit}>
			<button onclick={post} disabled={!postable}>
				<span>{@render submitText()}</span>
				{@html chevvy}
			</button>
		</div>

		{#if error}
			<div class={styles.Error}>{error}</div>
		{/if}

		{#if showInset && echo}
			<DynamicPost post={echo} inset="echo" />
		{/if}
	</div>
</div>
