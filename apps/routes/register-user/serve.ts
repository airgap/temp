import { serveHttp } from '@lyku/route-helpers';
import registerUser from '.';
serveHttp(registerUser);
