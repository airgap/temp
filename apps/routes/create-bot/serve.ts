import { serveHttp } from "@lyku/route-helpers";
import createBot from ".";

serveHttp(createBot);