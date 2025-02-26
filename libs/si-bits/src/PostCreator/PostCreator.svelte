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
  import chevvy from '../assets/chevvy.svg';
  import { phrasebook } from '../phrasebook';
  import styles from './PostCreator.module.sass';
  import { cacheStore } from '../CacheProvider';

  const { user, reply = undefined, echo = undefined, showInset = undefined } = $props<{
    user: User;
    reply?: bigint;
    echo?: bigint; 
    showInset?: boolean;
  }>();

  let { id, body, error, files, imageDrafts, videoDrafts, pending, finalizing } = $state({
    id: undefined as bigint | undefined,
    body: '',
    error: undefined as string | undefined,
    files: [] as File[],
    imageDrafts: undefined as ImageDraft[] | undefined,
    videoDrafts: undefined as VideoDraft[] | undefined,
    pending: 0,
    finalizing: false
  });

  const replyToPost = $derived(() => {
    if (!reply) return undefined;
    return cacheStore.caches.posts.get(reply);
  });

  const echoPost = $derived(() => {
    if (!echo) return undefined;
    return cacheStore.caches.posts.get(echo);
  });

  $effect(() => {
    if (reply && !replyToPost) {
      cacheStore.posts.fetch(reply);
    }
  });

  $effect(() => {
    if (echo && !echoPost) {
      cacheStore.posts.fetch(echo);
    }
  });

  const submitText = $derived(() => {
    return echoPost
      ? phrasebook.echo
      : replyToPost
      ? phrasebook.reply
      : phrasebook.post;
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
        window.location.pathname = `/p/${id}`;
        console.log('ViewPost finalization:', res);
        finalizing = false;
        clear();
      });
    }
  });

  const postable = $derived(() => {
    return (files.length || body?.length > 0) && !error;
  });

  async function post() {
    console.log('submitting', body);
    pending = files.length;
    const result = await api.draftPost({
      body,
      attachments: files.map(({ type, size }) => ({
        type: type as AttachmentMime,
        size,
      })),
      replyTo: replyToPost?.id,
      echoing: echoPost?.id,
    });

    if (!result.id) {
      error = result.error ?? phrasebook.unknownFrontendError;
      return;
    }

    id = result.id;
    imageDrafts = result.imageDrafts;
    videoDrafts = result.videoDrafts;
    console.log(
      'ViewPost submitted successfully.',
      imageDrafts ?? 'No images',
      videoDrafts ?? 'No videos'
    );
  }

  function depend() {
    pending -= 1;
  }

  const placeholder = $derived(() => {
    return echoPost
      ? phrasebook.postBodyEchoPlaceholder
      : replyToPost
      ? phrasebook.postBodyReplyPlaceholder
      : phrasebook.postBodyStandardPlaceholder;
  });

  function handleFileChange(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    if (target.files) {
      files = [...files, ...Array.from(target.files)];
    }
  }
</script>

<div class={styles.PostCreator}>
  {#if showInset && replyToPost}
    <DynamicPost post={replyToPost} inset="reply" />
  {/if}
  
  <div class:${styles.newPost}={replyToPost}>
    {#if replyToPost}
      <span class={dynaPost.hatchInset}>
        <Crosshatch width="20px" height="100%" />
      </span>
    {/if}
    
    <div class={styles.UserDetails}>
      <ProfilePicture
        src={user.profilePicture ?? defaultImages.ProfilePicture}
        size="m"
      />
      <Link class={styles.Username}>{user.username}</Link>
    </div>

    <div class={styles.editBox}>
      <UploadButton onchange={handleFileChange} />
      <span class={styles.editor}>
        <Tippy
          onEditorChange={(newVal) => body = newVal}
        />
      </span>
    </div>

    <div class={styles.imageList}>
      {#each files as file, f}
        {@const pack = imageDrafts?.find((d) => d.filename === file.name) ?? 
                      videoDrafts?.find((d) => d.filename === file.name)}
        <ImageUpload
          key={file.name}
          reason="PostAttachment"
          {file}
          working={Boolean(pending) || Boolean(pack)}
          removeClicked={pending ? undefined : 
            () => files = [...files.slice(0, f), ...files.slice(f + 1)]}
          attachmentUploadPack={pack}
          onUpload={depend}
          allowVideo={true}
        />
      {/each}
    </div>

    <div class={styles.Submit}>
      <Button onclick={post} disabled={!postable}>
        <span>{submitText}</span>
        <img src={chevvy} alt={submitText} aria-hidden={true} />
      </Button>
    </div>

    {#if error}
      <div class={styles.Error}>{error}</div>
    {/if}

    {#if showInset && echoPost}
      <DynamicPost post={echoPost} inset="echo" />
    {/if}
  </div>
</div> 