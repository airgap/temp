import styles from './ChannelLogo.module.sass';
import face from './face.png';

export const ChannelLogo = ({ url }: { url?: string }) => (
	<span className={styles.ChannelLogo}>
		<img src={url || face} alt="Channel logo" />
	</span>
);
