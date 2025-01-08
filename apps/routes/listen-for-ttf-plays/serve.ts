import listenForTtfPlays from './index';
import { serveWebsocket } from '@lyku/route-helpers';

serveWebsocket(listenForTtfPlays);
