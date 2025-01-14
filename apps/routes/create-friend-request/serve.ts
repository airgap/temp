import { serveHttp } from '@lyku/route-helpers';
import createFriendRequest from '.';

serveHttp(createFriendRequest);
