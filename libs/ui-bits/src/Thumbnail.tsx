import { Image, ImageProps } from './Image';
import styles from './Thumbnail.module.sass';

export const Thumbnail = (props: ImageProps) => (
	<span className={styles.Thumbnail}>
		<Image {...props} />
	</span>
);
