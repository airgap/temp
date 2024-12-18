import classnames from 'classnames';
import { ReactNode, useEffect, useState } from 'react';
import { PopupBox } from './PopupBox';
import styles from './PopupOverlay.module.sass';
import { bind, unbind } from '../bind';

export const PopupOverlay = ({ children }: { children?: ReactNode }) => {
	const [shown, setShown] = useState(false);
	const overlay = String(Math.random()).substring(2);

	useEffect(() => {
		const showHandler = () => setShown(true);
		const hideHandler = () => setShown(false);

		bind(window, `show${overlay}`, showHandler);
		bind(window, `hide${overlay}`, hideHandler);

		return () => {
			unbind(window, `show${overlay}`, showHandler);
			unbind(window, `hide${overlay}`, hideHandler);
		};
	}, [overlay]);

	return (
		<div
			className={classnames(styles.WinOverlay, {
				shown: shown,
			})}
		>
			<PopupBox overlay={overlay}>{children}</PopupBox>
		</div>
	);
};
