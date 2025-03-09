<script lang="ts">
  //@ts-ignore
  import * as tus from 'tus-js-client';
  import classnames from 'classnames';
  import { imageAndVideoMimes, imageMimes } from '@lyku/defaults';
  import { api, currentPlatform } from 'monolith-ts-api';
  import type { ImageDraft, ImageUploadReason, VideoDraft } from '@lyku/json-models';
  import styles from './ImageUpload.module.sass';
  
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

  // Props
  const { disabled = false, className = '', onUpload, channelId, reason, working = false, shape, allowVideo = false, image, file, removeClicked, attachmentUploadPack, onFinished } = $props<{ disabled?: boolean; className?: string; onUpload?: (id: string) => void; channelId?: bigint; reason: ImageUploadReason; working?: boolean; shape?: Shape; allowVideo?: boolean; image?: string; file?: File; removeClicked?: () => void; attachmentUploadPack?: ImageDraft | VideoDraft; onFinished?: () => void }>();

  // State
  let imageState = $state<string>();
  let base64 = $state<string>();
  let uploadUrl = $state<string>();
  let fileState = $state<File>(file);
  let workingState = $state(working);
  let inputId = $state(String(Math.random()).substring(2));
  let formRef: HTMLFormElement;
  let pack = $state<{ url: string; id: string }>();
  let submitting = $state(false);
  let succeeded = $state(false);

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
    if (pack && fileState && !submitting && !succeeded) {
      submitting = true;
      const data = new FormData();
      data.append('file', fileState);

      if (fileState.type.startsWith('video/')) {
        const upload = new tus.Upload(fileState, {
          endpoint: `://${apiHost}/getTusEndpoint/${pack.id}`,
          onSuccess: () =>
            api.confirmVideoUpload(pack.id).then(() => {
              onFinished?.();
              onUpload?.(pack.url);
              imageState = pack.url;
              succeeded = true;
              if (reason === 'AwayChannelBackground') window.location.reload();
            }),
        });
        upload.start();
      } else if (fileState.type.startsWith('image/')) {
        fetch(pack.url, {
          method: 'POST',
          body: data,
        }).then((r) =>
          r.json().then(async (cfres) => {
            await api.confirmImageUpload(pack.id);
            onFinished?.();
            onUpload?.(pack.url);
            imageState = pack.url;
            succeeded = true;
            if (reason === 'AwayChannelBackground') window.location.reload();
          })
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
      src={(imageState ? logoUrl() : base64 ?? logoUrl()) ?? defaultImages[reason]}
      {shape}
    />
  {:else}
    <span class={styles.attachmentImage}>
      {#if fileState?.type.startsWith('video/')}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video src={base64} ></video>
      {:else}
        <img src={base64} alt="Attachment" />
      {/if}
    </span>
  {/if}

  <Loading floating={true} visible={workingState} reverse={!pack} />
  
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

  <div class={styles.buttons}>
    {#if !(workingState || succeeded)}
      {#if base64}
        {#if file !== undefined}
          {#if removeClicked}
            <Button onclick={removeClicked}>
              <img src={times} alt="Remove" />
            </Button>
          {/if}
        {:else}
          <Button onclick={confirmClicked} disabled={workingState}>
            <img src={check} alt="Confirm" />
          </Button>
          <Button onclick={() => reset()} disabled={workingState}>
            <img src={x} alt="Cancel" />
          </Button>
        {/if}
      {:else}
        <label for={inputId} class={buttonStyles.Button}>
          {@render children?.()}
            {#if image !== undefined}
              <img class={styles.replace} src={replace} alt="Replace" />
            {/if}
          {@render children?.()}
        </label>
      {/if}
    {/if}
  </div>
</form> 