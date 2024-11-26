import { Property } from 'csstype';

import React, { CSSProperties, ReactNode } from 'react';
import { Size, sizes } from './sizes';

const layouts = { h: 'row', v: 'column' } as const;
type Layout = keyof typeof layouts;

type SeparateProps = {
	size: Size;
	layout: Layout;
	children: ReactNode;
	fill?: boolean;
	hang?: ReactNode;
	alignItems?: Property.AlignItems;
	style?: CSSProperties;
};
export const Divisio = ({
	size,
	layout,
	children,
	fill,
	hang,
	alignItems,
	style,
}: SeparateProps) => (
	<div
		style={{
			...style,
			position: 'relative',
			display: 'flex',
			flexDirection: layouts[layout],
			gap: sizes[size],
			...(fill ? { width: '100%' } : {}),
			alignItems,
		}}
	>
		{children}
		{hang && (
			<div style={{ position: 'absolute', top: 0, right: 0 }}>{hang}</div>
		)}
	</div>
);
