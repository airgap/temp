import { serveHttp } from '@lyku/route-helpers';
import getMyLikes from '.';

serveHttp(getMyLikes);
