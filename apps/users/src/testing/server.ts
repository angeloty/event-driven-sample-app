import * as express from "express";
import { configLoader } from "@ten-kc/core";
configLoader();

import { Application } from "@ten-kc/core";
import { Modules } from "./modules/modules";

const app: express.Express = express();
const application: Application = new Application(app, Modules);
application.init(process.env.PORT || 80, true);