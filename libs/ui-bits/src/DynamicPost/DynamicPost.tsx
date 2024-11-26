import classnames from 'classnames';
import { api } from 'monolith-ts-api';
import { useEffect, useState } from 'react';

import { Button } from '../Button';
import { Crosshatch } from '../Crosshatch';
import { DynamicDate } from '../DynamicDate';
import { Image } from '../Image';
import { Link } from '../Link';
import { PostList } from '../PostList';
import { ProfilePicture } from '../ProfilePicture';
import { formImageUrl } from '../formImageUrl';
import styles from './DynamicPost.module.sass';
import { Stream } from '@cloudflare/stream-react';
import { Post, User } from '@lyku/json-models';
import { useCacheSingleton } from '../CacheProvider';
import { PostCreator } from '../PostCreator';
import { useCurrentUser } from '../currentUserStore';
import { LikeButton } from '../LikeButton';
import { EchoButton } from '../EchoButton';
import { ReplyButton } from '../ReplyButton';
import { ShareButton } from '../ShareButton';
const insets = { reply: styles.replied, echo: styles.echoed } as const;

type Inset = keyof typeof insets;
type Props = {
	post: Post;
	inset?: Inset | false;
	showReplies?: boolean;
	autoplay?: boolean;
	author?: User;
};
const urlRegex =
	/(?:(?:http|ftp|https):\/\/)?(?:[\w-]+(?:(?:\.[\w-]+)+))(?::\d{2,5})?[^ "]*/g;
const stripLink = (url: string) =>
	url.split(/:\/\//)[1].replace(/:[0-9]{2,5}/, '');
const stripLinks = (body: string) =>
	body.replace(urlRegex, url => `<a href='${url}'>${stripLink(url)}</a>`);
const PostBody = ({ children }: { children: string }) => (
	<p
		className={classnames(styles.body, {
			[styles.brief]: children.length < 100,
		})}
		// This shit is sanitized before it ever makes it into a database
		dangerouslySetInnerHTML={{ __html: stripLinks(children) }}
	></p>
);
export const DynamicPost = ({
	// author,
	post,
	inset = false,
	showReplies = false,
	autoplay = false,
}: Props) => {
	const me = useCurrentUser();
	const [replies, setReplies] = useState<Post[]>([]);
	const [queriedReplies, setQueriedReplies] = useState(false);
	const [error, setError] = useState<string>();
	const [author] = useCacheSingleton('users', post.authorId);
	const [showReplyer, setShowReplyer] = useState(false);

	useEffect(() => {
		if (error) console.error(error);
	}, [error]);

	useEffect(() => {
		console.log('replies', post.replies);
		if (queriedReplies || !post.replies) return;
		setQueriedReplies(true);
		api.listPostReplies({ id: post.id }).then(({ posts }) =>
			setReplies(posts),
		);
	}, [queriedReplies, post]);
	const content = (
		<>
			{inset === 'echo' && (
				<span className={styles.hatchInset}>
					<Crosshatch width="20px" height="100%" />
				</span>
			)}
			{author && (
				<span className={styles.pp}>
					<ProfilePicture
						size="m"
						url={formImageUrl(author.profilePicture)}
					/>
				</span>
			)}
			<span className={styles.text}>
				{author && (
					<>
						<Link
							className={styles.username}
							href={`/u/${author.username}`}
						>
							{author.username}
						</Link>
						<DynamicDate time={post.published} />
						{me?.id === author.id && (
							<Button
								className={styles.delete}
								onClick={e => {
									e.preventDefault();
									window.confirm('Really delete?') &&
										api.deletePost(post.id).then(() => {
											window.alert('ViewPost deleted');
											window.location.reload();
										});
								}}
							>
								X
							</Button>
						)}
					</>
				)}
				<span className={styles.PostContent}>
					{post.title && <h1>{post.title}</h1>}
				</span>
				{post.body && <PostBody>{post.body}</PostBody>}
			</span>
			{'attachments' in post && (
				<div
					className={classnames(
						styles.attachments,
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
					)}
				>
					{post.attachments.map(at => {
						switch (at.supertype) {
							case 'image':
								return (
									<Image
										url={at.variants[0]}
										size="full-post"
									/>
								);
							case 'video':
								return (
									<Stream
										src={at.uid}
										controls={true}
										autoplay={autoplay}
										onAbort={e =>
											setError('Video failed to load')
										}
									/>
								);
						}
						return '';
					})}
				</div>
			)}

			{!inset && (
				<>
					<span className={styles.PostStats}>
						<LikeButton post={post} />
						<EchoButton post={post} />
						<ReplyButton
							onClick={() => setShowReplyer(!showReplyer)}
						/>
						<ShareButton post={post} />
					</span>
					{showReplyer && me && (
						<>
							<br />
							<PostCreator
								showInset={false}
								reply={post.id}
								user={me}
							/>
						</>
					)}
				</>
			)}
			{showReplies && replies.length > 0 && (
				<>
					<div className={styles.sep} />
					<PostList posts={replies} inset={1} />
				</>
			)}
		</>
	);
	const className = classnames(styles.DynamicPost, inset && insets[inset]);
	return <span className={className}>{content}</span>;
};
