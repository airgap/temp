import { serveHttp } from '@lyku/route-helpers';
import getFriendshipStatus from '.';

serveHttp(getFriendshipStatus);
