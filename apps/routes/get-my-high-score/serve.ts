import { serveHttp } from '@lyku/route-helpers';
import getMyHighScore from '.';
serveHttp(getMyHighScore);
