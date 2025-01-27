import classnames from 'classnames';
import { ReactNode } from 'react';

import { DynamicPost } from '../DynamicPost';

import styles from './PostList.module.sass';
import { Post } from '@lyku/json-models';

type Props = {
	posts: Post[];
	inset?: number;
	placeholder?: ReactNode;
};

export const PostList = ({ posts, inset, placeholder }: Props) => (
	<div className={classnames(styles.PostList, { [styles.inset]: inset })}>
		{posts?.length
			? posts.map((post) => (
					<DynamicPost post={post} key={post.id} autoplay={false} />
				))
			: placeholder}
	</div>
);
