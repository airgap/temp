import { serveWebsocket } from '@lyku/route-helpers';
import listenForAchievements from './index';
serveWebsocket(listenForAchievements);
