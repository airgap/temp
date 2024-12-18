import { formImageUrl } from '../formImageUrl';
import styles from './Backdrop.module.sass';
import drop from './drop.png';

export const Backdrop = ({ image }: { image?: string }) => (
	<div className={styles.Backdrop}>
		<img src={image ? formImageUrl(image) : drop} alt="Backdrop" />
	</div>
);
