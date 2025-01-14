import { serveHttp } from '@lyku/route-helpers';
import getUsers from '.';

serveHttp(getUsers);
