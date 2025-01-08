import { serveHttp } from '@lyku/route-helpers';
import listenToPostCount from './index';
serveHttp(listenToPostCount);
