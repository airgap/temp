import { serveHttp } from '@lyku/route-helpers';
import getLeaderboard from '.';

serveHttp(getLeaderboard);
