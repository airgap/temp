import { serveHttp } from '@lyku/route-helpers';
import handler from './index';

serveHttp(handler);
