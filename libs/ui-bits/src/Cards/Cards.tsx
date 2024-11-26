import { ReactElement } from 'react';

import { Card } from '../Card/Card';
import { Cardless } from '../Cardless';
import styles from './Cards.module.sass';

type Props = { children?: ReactElement[] };

/**
 * @noInheritDoc
 */
export const Cards = ({ children }: Props) => (
	<div className={styles.Cards}>
		{children?.map((child, i) => {
			return child.type === Cardless.name ? (
				<span key={i}>child</span>
			) : (
				<Card key={i}>{child}</Card>
			);
		})}
	</div>
);
