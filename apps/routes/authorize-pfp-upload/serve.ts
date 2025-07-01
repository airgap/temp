import { serveHttp } from '@lyku/route-helpers';
import authorizePfpUpload from '.';

serveHttp(authorizePfpUpload);
