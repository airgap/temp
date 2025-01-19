import { serveWebsocket } from '@lyku/route-helpers';
import streamCurrentUser from './index';
serveWebsocket(streamCurrentUser);
