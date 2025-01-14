import { serveHttp } from '@lyku/route-helpers';
import getCurrentUser from '.';

serveHttp(getCurrentUser);
