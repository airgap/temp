<script lang="ts">
	//@ts-ignore
	import * as tus from 'tus-js-client';
	import classnames from 'classnames';
	import { imageAndVideoMimes, imageMimes } from '@lyku/defaults';
	import { api, apiHost, currentPlatform } from 'monolith-ts-api';
	// import Chunks from './Chunks.svelte';
	import ChunkViz from './ChunkViz.svelte';
	import type {
		ImageDraft,
		ImageUploadReason,
		VideoDraft,
	} from '@lyku/json-models';
	import styles from './ImageUpload.module.sass';
	import { defaultImages } from './defaultImages';
	import * as UpChunk from '@mux/upchunk';

	import times from '../times.svg?raw';
	import bg from '../Backdrop/blu.jpg';
	import { Button } from '../Button';
	import buttonStyles from '../Button/Button.module.sass';
	import { Image, type Shape } from '../Image';
	import { Loading } from '../LoadingOverlay';
	import { formImageUrl } from '../formImageUrl';
	import replace from '../assets/replace.svg?raw';
	import check from '../assets/squircle-check.svg?raw';
	import x from '../assets/x.svg?raw';
	import type { ComponentType } from 'svelte';

	// Props
	const {
		disabled = false,
		className = '',
		onUpload,
		channelId,
		reason,
		working = false,
		shape,
		allowVideo = false,
		image,
		file,
		removeClicked,
		attachmentUploadPack = $bindable(),
		onFinished,
		children,
	} = $props<{
		disabled?: boolean;
		className?: string;
		onUpload?: (id: string) => void;
		channelId?: bigint;
		reason: ImageUploadReason;
		working?: boolean;
		shape?: Shape;
		allowVideo?: boolean;
		image?: string;
		file?: File;
		removeClicked?: () => void;
		attachmentUploadPack?: ImageDraft | VideoDraft;
		onFinished?: () => void;
		children?: ComponentType;
	}>();

	// State
	let imageState = $state<string>();
	let upload = $state<UpChunk>();
	let base64 = $state<string>();
	let uploadUrl = $state<string>();
	let fileState = $state<File>(file);
	let pack = $state<FileDraft>();
	let workingState = $state(working);
	let inputId = $props.id();
	let formRef: HTMLFormElement;
	let submitting = $state(false);
	let succeeded = $state(false);
	let uploaded = $state(false);
	let processed = $state(false);

	const readFile = (file: File): Promise<string> =>
		new Promise((r, j) => {
			const reader = new FileReader();
			reader.onload = () => r(reader.result as string);
			reader.readAsDataURL(file);
		});

	// Reactive statements
	$effect(() => {
		workingState = working;
	});

	$effect(() => {
		console.log('Packed?', attachmentUploadPack);
		if (attachmentUploadPack) {
			pack = {
				id: attachmentUploadPack.id,
				url: attachmentUploadPack.uploadURL,
			};
			workingState = true;
		}
	});

	$effect(() => {
		if (file && file !== fileState) {
			fileState = file;
		}
	});

	$effect(() => {
		if (fileState) {
			workingState = true;
			readFile(fileState).then((logo) => {
				base64 = logo;
				workingState = false;
			});
		}
	});

	// Methods
	const imageSelected = async (input: HTMLInputElement) => {
		const f = input.files?.[0];
		fileState = f;
		if (!f) throw new Error('No file selected');
	};

	const confirmClicked = async () => {
		if (!fileState) return;
		workingState = true;
		const res = await api.authorizeImageUpload({
			channelId,
			reason,
		});
		pack = res;
	};

	const reset = (newImage?: string) => {
		pack = undefined;
		fileState = undefined;
		base64 = undefined;
		imageState = newImage ?? image;
		uploadUrl = undefined;
		workingState = false;
		submitting = false;
	};

	// Handle upload
	$effect(() => {
		console.log('bahaha', pack, fileState, submitting, succeeded);
		if (pack && fileState && !submitting && !succeeded) {
			submitting = true;
			processed = false;
			uploaded = false;
			const data = new FormData();
			data.append('file', fileState);

			console.log('Getting file');
			api.getFile({ file: pack.id, wait: true }).then(() => {
				processed = true;
				console.log('GetFile succeeded');
				// api.confirmVideoUpload(pack.id).then(() => {
				onFinished?.();
				onUpload?.(pack.url);
				imageState = pack.url;
				succeeded = true;
				// if (reason === 'AwayChannelBackground') window.location.reload();
				// });
			});
			if (fileState.type.startsWith('video/')) {
				upload = UpChunk.createUpload({
					endpoint: pack.url, // Authenticated url
					file: fileState, // File object with your video file’s properties
					chunkSize: 30720, //Math.min(30720, file.size/4), // Uploads the file in ~30 MB chunks
				});

				// Subscribe to events
				upload.on('error', (error) => {
					submitting = false;
					// setStatusMessage(error.detail);
				});

				upload.on('progress', (progress) => {
					// setProgress(progress.detail);
				});

				upload.on('success', () => {
					console.info('Video upload succeeded');
					uploaded = true;
					// 	// api.confirmVideoUpload(pack.id).then(() => {
					// 	onFinished?.();
					// 	onUpload?.(pack.url);
					// 	imageState = pack.url;
					// 	succeeded = true;
					// 	// if (reason === 'AwayChannelBackground') window.location.reload();
					// 	// });
				});
			} else if (fileState.type.startsWith('image/')) {
				fetch(pack.url, {
					method: 'POST',
					body: data,
				}).then((r) =>
					r.json().then(async (cfres) => {
						uploaded = true;
						await api.confirmImageUpload(pack.id);
						// processed = true;
						// onFinished?.();
						// onUpload?.(pack.url);
						// imageState = pack.url;
						// succeeded = true;
						// if (reason === 'AwayChannelBackground') window.location.reload();
					}),
				);
			}
		}
	});

	$effect(() => {
		if (succeeded) {
			workingState = false;
			reset();
		}
	});

	const logoUrl = () => {
		const id = imageState || image;
		return id ? formImageUrl(id, 'btvprofile') : defaultImages[reason];
	};
</script>

<form
	action={uploadUrl}
	method="post"
	enctype="multipart/form-data"
	onsubmit={confirmClicked}
	bind:this={formRef}
	class={classnames(styles.ImageUpload, {
		[styles.working]: workingState,
		[styles.succeeded]: succeeded,
	})}
>
	{#if image !== undefined}
		<Image
			size="l"
			src={(imageState ? logoUrl() : (base64 ?? logoUrl())) ??
				defaultImages[reason]}
			{shape}
		/>
	{:else}
		<span class={styles.attachmentImage}>
			{#if fileState?.type.startsWith('video/')}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={base64}></video>
			{:else}
				<img src={base64} alt="Attachment" />
			{/if}
		</span>
	{/if}

	<!-- <Loading floating={true} visible={workingState} reverse={!pack} /> -->

	<img
		class={classnames(styles.Success, {
			[styles.visible]: succeeded,
		})}
		src={check}
		alt="Success"
	/>

	<input
		id={inputId}
		accept={allowVideo ? imageAndVideoMimes : imageMimes}
		type="file"
		{disabled}
		class={classnames(styles.fileInput, className)}
		onchange={(event) => imageSelected(event.target as HTMLInputElement)}
	/>
	<!-- <Chunks {uploaded} {processed} {upload} {file} /> -->
	<ChunkViz {upload} {file} />
	<div class={styles.buttons}>
		{#if !(workingState || succeeded)}
			{#if base64}
				{#if file !== undefined}
					{#if removeClicked}
						<Button onClick={removeClicked}>
							{@html times}
						</Button>
					{/if}
				{:else}
					<Button onClick={confirmClicked} disabled={workingState}>
						{@html check}
					</Button>
					<Button onClick={() => reset()} disabled={workingState}>
						{@html x}
					</Button>
				{/if}
			{:else}
				<label for={inputId} class={buttonStyles.Button}>
					{@render children?.()}
					{#if image !== undefined}
						{@html replace}
					{/if}
					{@render children?.()}
				</label>
			{/if}
		{/if}
	</div>
</form>
