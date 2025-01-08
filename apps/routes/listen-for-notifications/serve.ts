import { serveWebsocket } from '@lyku/route-helpers';
import listenForNotifications from './index';
serveWebsocket(listenForNotifications);
