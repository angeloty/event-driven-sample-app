import * as express from "express";
import { BaseModule } from "@ten-kc/core";
import { UserController } from "./controllers/user.controller";
import { UserSubscriptions } from "./subscriptions/user.subscription";

export class UserModule extends BaseModule {
  constructor(app: express.Express) {
    super(app, {
      controllers: [UserController],
    });
    UserSubscriptions.register();
  }
}