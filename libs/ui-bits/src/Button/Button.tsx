import classnames from 'classnames';
import {
	ButtonHTMLAttributes,
	CSSProperties,
	FormEventHandler,
	ReactNode,
} from 'react';

import styles from './Button.module.sass';

type Props = {
	disabled?: boolean;
	className?: string;
	children?: ReactNode;
	onClick?: FormEventHandler<HTMLButtonElement>;
	type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
	style?: CSSProperties;
};

/**
 * @noInheritDoc
 */
export const Button = (props: Props) => (
	<button
		disabled={props.disabled}
		className={classnames(styles.Button, props.className)}
		onClick={props.onClick}
		type={props.type ?? 'button'}
		style={props.style}
	>
		{props.children}
	</button>
);
