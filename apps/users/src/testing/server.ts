import * as express from "express";
import { configLoader } from "@ten-kc/core";
configLoader(process.cwd());

import { Application } from "@ten-kc/core";
import { Modules } from "./modules/modules";

const app: express.Express = express();
export const application: Application = new Application(app, Modules, {
  testing: true,
});