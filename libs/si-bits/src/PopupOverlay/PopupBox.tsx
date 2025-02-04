import { ReactNode, useCallback } from 'react';

import styles from './PopupBox.module.sass';

export const PopupBox = (props: {
	children?: ReactNode;
	overlay: string;
	buttonContent?: ReactNode;
}) => {
	const dismiss = useCallback(
		() => window.dispatchEvent(new Event(`hide${props.overlay}`)),
		[props.overlay]
	);
	return (
		<div className={styles.WinBox}>
			<button className={styles.close} onClick={dismiss}></button>
			{props.children}
			{props.buttonContent && (
				<button className={styles.action} onClick={dismiss}>
					this.props.buttonContent
				</button>
			)}
		</div>
	);
};
