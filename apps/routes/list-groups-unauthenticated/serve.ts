import { serveHttp } from '@lyku/route-helpers';
import listGroupsUnauthenticated from './index';
serveHttp(listGroupsUnauthenticated);
