import { ReactionButton } from './ReactionButton';
import { useCacheSingleton } from './CacheProvider';
import filledHeart from './assets/filledheart.svg';
import emptyHeart from './assets/heart.svg';
import { shout } from './Sonic';
import { UserRegistrationForm } from './authForms';
import { api, sessionId } from 'monolith-ts-api';
import { Post } from '@lyku/json-models';

export const LikeButton = ({ post }: { post: Post }) => {
	const liked = useCacheSingleton('myLikes', post.id)[0]?.liked;
	return (
		<ReactionButton
			glyph={liked ? filledHeart : emptyHeart}
			onClick={() => {
				// console.log('showing auth');
				if (!sessionId) {
					shout('showAuth', <UserRegistrationForm />);
					return;
				}
				api[liked ? 'unlikePost' : 'likePost'](post.id).catch(
					console.error,
				);
			}}
		/>
	);
};
