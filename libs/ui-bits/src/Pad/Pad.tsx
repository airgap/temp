import { ReactNode } from 'react';
import { sizes, Size } from '../sizes';
export const Pad = ({
  size,
  children,
}: {
  size: Size;
  children: ReactNode;
}) => <div style={{ margin: sizes[size] }}>{children}</div>;
