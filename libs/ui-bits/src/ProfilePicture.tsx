import { Image, ImageProps } from './Image';
import styles from './Image/Image.module.sass';

export type PPP = Omit<ImageProps, 'squircle'>;
export const ProfilePicture = (props: PPP) => (
	<span className={styles.ProfilePicture}>
		<Image shape={'squircle'} {...props} />
	</span>
);
