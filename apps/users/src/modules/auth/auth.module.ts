import * as express from "express";
import { BaseModule } from "@ten-kc/core";
import { AuthController } from "./controllers/auth.controller";
import { AuthSubscriptions } from "./subscriptions/auth.subscription";

export class AuthModule extends BaseModule {
  constructor(app: express.Express) {
    super(app, {
      controllers: [AuthController],
    });
    AuthSubscriptions.register();
  }
}