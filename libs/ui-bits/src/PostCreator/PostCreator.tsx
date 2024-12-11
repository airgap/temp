import { Editor } from '@tinymce/tinymce-react';
import classnames from 'classnames';
import { safeTags } from '@lyku/helpers';
import { api } from 'monolith-ts-api';
import { useEffect, useState } from 'react';

// import { AttachmentDraft, User, Uuid } from 'types';
import { AttachmentMime, User, AttachmentDraft } from '@lyku/json-models';
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

type Props = {
  user: User;
  reply?: string;
  echo?: string;
  showInset?: boolean;
};

export const PostCreator = ({
  user: { profilePicture, username },
  reply,
  echo,
  showInset,
}: Props) => {
  const [id, setId] = useState<string>();
  const [body, setBody] = useState('');
  const [error, setError] = useState<string>();
  const [postable, setPostable] = useState(false);
  // const [echoPost, setEchoPost] = useState<ViewPost>();
  // const [replyToPost, setReplyToPost] = useState<ViewPost>();
  const [files, setFiles] = useState<File[]>([]);
  const [packs, setPacks] = useState<AttachmentDraft[]>();
  const [pending, setPending] = useState(0);
  const [finalizing, setFinalizing] = useState(false);

  const [replyToPost] = useCacheSingleton('posts', reply);
  const [echoPost] = useCacheSingleton('posts', echo);
  const submitText = echoPost
    ? phrasebook.echo
    : replyToPost
      ? phrasebook.reply
      : phrasebook.post;
  const clear = () => {
    setId(undefined);
    setBody('');
    setError(undefined);
    setPostable(false);
    setFiles([]);
    setPacks([]);
    setPending(0);
    setFinalizing(false);
  };
  useEffect(() => {
    console.log('pending', pending, 'finalizing', finalizing, 'id', id);
    if (pending || finalizing || !id) return;
    console.log('Finalizing post', id);
    setFinalizing(true);
    api.finalizePost({ id }).then((res) => {
      window.location.pathname = `/p/${id}`;
      console.log('ViewPost finalization:', res);
      setFinalizing(false);
      clear();
    });
  }, [pending, finalizing, id]);
  useEffect(() => {
    setPostable((files || body?.length > 0) && !error);
  }, [files, body, error]);
  const post = async () => {
    console.log('submitting', body);
    setPending(files.length);
    const { error, id, attachmentUploadPacks } = await api.draftPost({
      body,
      attachments: files.map(({ type, size }) => ({
        type: type as AttachmentMime,
        size,
      })),
      replyTo: replyToPost?.id,
      echoing: echoPost?.id,
    });
    if (!id) {
      setError(error ?? phrasebook.unknownFrontendError);
      return;
    }
    setId(id);
    setPacks(attachmentUploadPacks);
    console.log(
      'ViewPost submitted successfully.',
      attachmentUploadPacks ?? 'No attachments',
    );
  };
  console.log('Files', files);
  const depend = () => setPending((p) => p - 1);
  const placeholder = echoPost
    ? phrasebook.postBodyEchoPlaceholder
    : replyToPost
      ? phrasebook.postBodyReplyPlaceholder
      : phrasebook.postBodyStandardPlaceholder;
  return (
    <div className={styles.PostCreator}>
      {showInset && replyToPost && (
        <DynamicPost post={replyToPost} inset="reply" />
      )}
      <div className={classnames({ [styles.newPost]: replyToPost })}>
        {replyToPost && (
          <span className={dynaPost.hatchInset}>
            <Crosshatch width="20px" height="100%" />
          </span>
        )}
        <div className={styles.UserDetails}>
          <ProfilePicture
            id={profilePicture ?? defaultImages.ProfilePicture}
            size="m"
          />
          <Link className={styles.Username}>{username}</Link>
        </div>
        <div className={styles.editBox}>
          <UploadButton
            onChange={(e) =>
              e.currentTarget.files &&
              setFiles([...files, ...Array.from(e.currentTarget.files)])
            }
          />
          <span className={styles.editor}>
            <Editor
              init={{
                // editable_class: styles.editable,
                menubar: false,
                toolbar: false,
                inline: true,
                plugins: ['wordcount'],
                valid_elements: safeTags.join(','),
                // body_class: styles.editor,
                placeholder,
              }}
              apiKey={'n8aknziwp4321kn27h8m3pw30sj42t7akub6yexbtpm0wv5d'}
              onEditorChange={(newVal, editor) => setBody(newVal)}
              // onInit={(event, editor) => editorRef.current = editor}
            />
          </span>
        </div>
        <div className={styles.imageList}>
          {files.map((file, f) => (
            <ImageUpload
              key={file.name}
              reason="PostAttachment"
              file={file}
              working={Boolean(pending) || Boolean(packs?.[f])}
              removeClicked={
                pending
                  ? undefined
                  : () => setFiles(files.slice(0, f).concat(files.slice(f + 1)))
              }
              attachmentUploadPack={packs?.[f]}
              onUpload={depend}
              allowVideo={true}
            />
          ))}
        </div>
        <div className={styles.Submit}>
          <Button onClick={post} disabled={!postable}>
            <span>{submitText}</span>
            <img src={chevvy} alt={submitText} aria-hidden={true} />
          </Button>
        </div>
        {error && <div className={styles.Error}>{error}</div>}
        {showInset && echoPost && <DynamicPost post={echoPost} inset="echo" />}
      </div>
    </div>
  );
};
