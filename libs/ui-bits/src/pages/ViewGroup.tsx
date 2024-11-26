import { api, sessionId } from 'monolith-ts-api';
import { PostList } from '../PostList';
import { useCacheSingleton } from '../CacheProvider';
import { Await } from 'awaitx';

export const ViewGroup = () => {
	const groupId = document.location.pathname.split('/g/')?.[1];
	const [group] = useCacheSingleton('groups', groupId);
	return (
		<Await
			source={() =>
				sessionId
					? api.listFeedPosts({ groups: [groupId] })
					: api.listFeedPostsUnauthenticated({ groups: [groupId] })
			}
			then={posts => (
				<>
					<h2>{group?.name}</h2>
					<PostList posts={posts} />
				</>
			)}
		/>
	);
};
