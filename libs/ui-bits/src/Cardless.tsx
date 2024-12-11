import { FC, ReactNode } from 'react';

type Props = { children: ReactNode };
export const Cardless: FC<Props> = ({ children }) => (
  <div className="cardless">{children}</div>
);
