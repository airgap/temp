import { serveHttp } from '@lyku/route-helpers';
import getGroups from '.';

serveHttp(getGroups);
