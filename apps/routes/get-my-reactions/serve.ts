import { serveHttp } from '@lyku/route-helpers';
import getMyReactions from '.';

serveHttp(getMyReactions);
