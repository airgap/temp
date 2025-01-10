import { serveHttp } from "@lyku/route-helpers";
import authorizeImageUpload from ".";

serveHttp(authorizeImageUpload);