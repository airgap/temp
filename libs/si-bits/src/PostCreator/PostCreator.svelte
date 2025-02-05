<script lang="ts">
  import { Editor } from '@tinymce/tinymce-svelte';
  import { safeTags } from '@lyku/helpers';
  import { api } from 'monolith-ts-api';
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
  import { useCacheSingleton } from '../CacheProvider';

  export let user: User;
  export let reply: bigint | undefined = undefined;
  export let echo: bigint | undefined = undefined;
  export let showInset: boolean | undefined = undefined;

  let id: bigint | undefined;
  let body = '';
  let error: string | undefined;
  let postable = false;
  let files: File[] = [];
  let imageDrafts: ImageDraft[] | undefined;
  let videoDrafts: VideoDraft[] | undefined;
  let pending = 0;
  let finalizing = false;

  const [replyToPost] = useCacheSingleton('posts', reply);
  const [echoPost] = useCacheSingleton('posts', echo);

  $: submitText = echoPost
    ? phrasebook.echo
    : replyToPost
    ? phrasebook.reply
    : phrasebook.post;

  function clear() {
    id = undefined;
    body = '';
    error = undefined;
    postable = false;
    files = [];
    imageDrafts = [];
    videoDrafts = [];
    pending = 0;
    finalizing = false;
  }

  $: {
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
  }

  $: postable = (files.length || body?.length > 0) && !error;

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

  $: placeholder = echoPost
    ? phrasebook.postBodyEchoPlaceholder
    : replyToPost
    ? phrasebook.postBodyReplyPlaceholder
    : phrasebook.postBodyStandardPlaceholder;

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
        url={user.profilePicture ?? defaultImages.ProfilePicture}
        size="m"
      />
      <Link class={styles.Username}>{user.username}</Link>
    </div>

    <div class={styles.editBox}>
      <UploadButton on:change={handleFileChange} />
      <span class={styles.editor}>
        <Editor
          init={{
            menubar: false,
            toolbar: false,
            inline: true,
            plugins: ['wordcount'],
            valid_elements: safeTags.join(','),
            placeholder,
          }}
          apiKey={'n8aknziwp4321kn27h8m3pw30sj42t7akub6yexbtpm0wv5d'}
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
      <Button on:click={post} disabled={!postable}>
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