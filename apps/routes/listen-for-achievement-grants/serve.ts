import { serveWebsocket } from '@lyku/route-helpers';
import listenForAchievementGrants from './index';
serveWebsocket(listenForAchievementGrants);
