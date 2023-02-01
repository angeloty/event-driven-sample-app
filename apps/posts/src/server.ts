import * as express from "express";
import { configLoader } from "@ten-kc/core";
configLoader();

import { Application } from "@ten-kc/core";
import { Modules } from "./modules/modules";
import { join } from "path";

const app: express.Express = express();
const path = `/${process.env.FILE_PUBLIC_FOLDER || "public"}`;
const folder = join(
  process.cwd(),
  process.env.FILE_PUBLIC_FOLDER || "public",
  process.env.FILE_PATH || "uploads"
);
app.use(path, express.static(folder));
const application: Application = new Application(app, Modules);
application.init(process.env.PORT || 80);