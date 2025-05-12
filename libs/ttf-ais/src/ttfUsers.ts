import type { User } from '@lyku/json-models';
import { ttfBots } from './ttfBots';

export const ttfUsers: User[] = Object.values(ttfBots).map((b) => b.user);
