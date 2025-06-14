import { serveHttp, serveWebsocket } from '@lyku/route-helpers';
import handler from '.';

serveWebsocket(handler);
