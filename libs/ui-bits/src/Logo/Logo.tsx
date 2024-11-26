import { ReactNode, RefObject } from 'react';

import { formImageUrl } from '../formImageUrl';
import { phrasebook } from '../phrasebook';
import styles from './Logo.module.sass';

export const Logo = ({
	x,
	y,
	id,
	children,
	logoRef,
	flashRef,
}: {
	x?: number;
	y?: number;
	id?: string;
	children?: ReactNode;
	logoRef?: RefObject<HTMLImageElement>;
	flashRef?: RefObject<HTMLDivElement>;
}) => (
	<div className={styles.Logo} style={{ left: x + 'px', top: y + 'px' }}>
		{id ? (
			<img src={formImageUrl(id)} alt={phrasebook.bounceLogoAlt} />
		) : (
			children
		)}
		<div className={styles.flash} />
	</div>
);
