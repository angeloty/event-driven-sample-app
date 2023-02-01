import * as express from "express";
import { BaseModule } from "@ten-kc/core";
import { PostController } from "./controllers/post.controller";

export class PostModule extends BaseModule {
  constructor(app: express.Express) {
    super(app, {
      controllers: [PostController],
    });
  }
}