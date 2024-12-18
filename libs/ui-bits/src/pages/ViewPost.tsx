import { api } from 'monolith-ts-api';
import { DynamicPost } from '../DynamicPost';

import styles from './ViewPost.module.sass';
import { Await } from 'awaitx';

export const ViewPost = () => (
	<div className={styles.PostPage}>
		<main>
			<Await
				source={() =>
					api.getPost(BigInt(window.location.pathname.split('p/')[1]))
				}
				then={(post) => <DynamicPost post={post} showReplies={true} />}
				fail={(error) => <h3>{error?.toString()}</h3>}
			/>
		</main>
	</div>
);
