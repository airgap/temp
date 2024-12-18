import { ReactNode, useState } from 'react';

import styles from './Agreeable.module.sass';

type Props = {
	onChange?: (agreed: boolean) => void | boolean;
	children?: ReactNode;
};
export const Agreeable = ({ onChange, children }: Props) => {
	const [id] = useState(Math.random().toString().substring(2));
	return (
		<div className={styles.Agreeable}>
			<input
				type="checkbox"
				id={id}
				onInput={({ currentTarget }) => onChange?.(currentTarget.checked)}
			/>
			<label htmlFor={id}>{children}</label>
		</div>
	);
};
