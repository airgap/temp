import { serveHttp } from '@lyku/route-helpers';
import listFriends from './index';
serveHttp(listFriends);
