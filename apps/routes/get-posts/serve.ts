import { serveHttp } from '@lyku/route-helpers';
import getPosts from '.';

serveHttp(getPosts);
