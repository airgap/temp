import { serveHttp } from "@lyku/route-helpers";
import getChannel from ".";

serveHttp(getChannel);
