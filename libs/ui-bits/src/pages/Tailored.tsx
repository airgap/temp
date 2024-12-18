import { api, sessionId } from 'monolith-ts-api';
import { PostCreator } from '../PostCreator';
import { PostList } from '../PostList';
import { phrasebook } from '../phrasebook';
import { MaybeUser } from '../currentUserStore';
import { Crosshatch } from '../Crosshatch';

import styles from './Feed.module.sass';
import { Await } from 'awaitx';

export const Tailored = () => {
	return (
		<div className={styles.FeedPage}>
			<div className={styles.Feed}>
				<MaybeUser
					loggedIn={(user) => (
						<>
							<PostCreator user={user} />
							<Crosshatch />
						</>
					)}
					loggedOut={() => <h2>{phrasebook.logInToPost}</h2>}
					failed={() => <>Failed to load user</>}
					meanwhile={() => <>Loading user...</>}
				/>
				<Await
					source={() =>
						sessionId
							? api.listFeedPosts({})
							: api.listFeedPostsUnauthenticated({})
					}
					then={(posts) => (
						<>
							<br />
							<h1>For you</h1>
							<PostList
								posts={posts ?? []}
								placeholder={
									<div>
										<br />
										{phrasebook.tailoredFeedEmpty}
										<br />
										<br />
										{phrasebook.followOnHot}
									</div>
								}
							/>
						</>
					)}
					fail={(error) => <h1>{String(error)}</h1>}
					meanwhile={<>Loading...</>}
				/>
			</div>
		</div>
	);
};
