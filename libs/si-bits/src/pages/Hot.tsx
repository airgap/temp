import { api } from 'monolith-ts-api';
import { PostList } from '../PostList';
import styles from './Feed.module.sass';
import { Await } from 'awaitx';

/**
 * @category page
 * Hot
 * @returns a FeedPage containing the hottest posts
 */
export const Hot = () => (
	<div className={styles.FeedPage}>
		<Await
			source={() => api.listHotPosts({})}
			then={(posts) => {
				return (
					<div className={styles.Feed}>
						<PostList posts={posts?.posts ?? []} />
					</div>
				);
			}}
			fail={(error) => <h3>{String(error)}</h3>}
			meanwhile={<>Loading posts...</>}
		/>
	</div>
);
