import { serveHttp } from '@lyku/route-helpers';
import getTusEndpoint from '.';

serveHttp(getTusEndpoint);
