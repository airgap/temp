<script lang="ts">
	import smile from '../smile.png';
	//@ts-ignore
	import * as tus from 'tus-js-client';
	import classnames from 'classnames';
	import { imageMimes } from '@lyku/defaults';
	import { api, apiHost, currentPlatform } from '@lyku/monolith-ts-api';
	// import Chunks from './Chunks.svelte';
	import { ChunkViz } from '../ChunkViz';
	import type { FileDraft } from '@lyku/json-models';
	import styles from './PfpUpload.module.sass';

	import times from '../times.svg?raw';
	import bg from '../Backdrop/blu.jpg';
	import { Button } from '../Button';
	import buttonStyles from '../Button/Button.module.sass';
	import { Image } from '../Image';
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
		working = false,
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
		working?: boolean;
		image?: string;
		file?: File;
		removeClicked?: () => void;
		attachmentUploadPack?: FileDraft;
		onFinished?: () => void;
		children?: ComponentType;
	}>();

	// State
	let imageState = $state<string>();
	let upload = $state<UpChunk>();
	let base64 = $state<string>();
	let extractingFrame = $state(false);
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
			console.log('Processing file:', fileState.name, fileState.type);

			readFile(fileState)
				.then((logo) => {
					base64 = logo;
					workingState = false;
				})
				.catch((error) => {
					console.error('Error reading image file:', error);
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
		pack = await api.authorizePfpUpload();
	};

	const reset = (newImage?: string) => {
		pack = undefined;
		fileState = undefined;
		base64 = undefined;
		extractingFrame = false;
		imageState = newImage ?? image;
		uploadUrl = undefined;
		workingState = false;
		submitting = false;
	};

	// Handle upload
	$effect(() => {
		console.log('pack', pack, fileState, submitting, succeeded);
		if (pack && fileState && !submitting && !succeeded) {
			submitting = true;
			processed = false;
			uploaded = false;
			const data = new FormData();
			data.append('file', fileState);

			console.log('Getting file');
			//api.awaitFile(pack.id).listen((e) => {
			//	processed = true;
			//	console.log('GetFile succeeded');
			//	onFinished?.();
			//	onUpload?.(pack.url);
			//	imageState = pack.url;
			//	succeeded = true;
			//});
			fetch(pack.url, {
				method: 'POST',
				body: data,
			}).then((r) =>
				r.json().then(async (cfres) => {
					console.log('cfres', cfres);
					uploaded = true;
					await api.confirmPfpUpload(pack.id);
					// processed = true;
					// onFinished?.();
					// onUpload?.(pack.url);
					// imageState = pack.url;
					// succeeded = true;
				}),
			);
		}
	});

	$effect(() => {
		if (succeeded) {
			workingState = false;
			reset();
		}
	});
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
			src={base64 ?? imageState ?? image ?? smile}
			shape="circle"
		/>
	{:else}
		<span class={styles.attachmentImage}>
			{#if base64}
				<img src={base64} alt="Attachment" />
			{/if}
		</span>
	{/if}

	<!-- <Loading floating={true} visible={workingState} reverse={!pack} /> -->

	<div
		class={classnames(styles.Success, {
			[styles.visible]: succeeded,
		})}
	>
		{@html check}
	</div>

	<input
		id={inputId}
		accept={imageMimes}
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
