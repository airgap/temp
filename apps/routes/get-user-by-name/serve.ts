import { serveHttp } from '@lyku/route-helpers';
import getUserByName from '.';

serveHttp(getUserByName);
