import { serveWebsocket } from '@lyku/route-helpers';
import listenToPostCount from './index';
serveWebsocket(listenToPostCount);
