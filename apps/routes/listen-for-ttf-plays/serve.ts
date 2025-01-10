import listenForTtfPlays from '.';
import { serveWebsocket } from '@lyku/route-helpers';

serveWebsocket(listenForTtfPlays);
