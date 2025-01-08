import { serveHttp } from '@lyku/route-helpers';
import listFeedPostsUnauthenticated from '.';

serveHttp(listFeedPostsUnauthenticated);
