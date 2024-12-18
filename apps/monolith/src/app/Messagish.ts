import { IncomingMessage } from 'http';

export type Messagish = IncomingMessage | { headers: Record<string, string> };
