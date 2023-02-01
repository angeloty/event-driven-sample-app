import * as express from "express";
import { BaseModule } from "@ten-kc/core";
import { CommentsController } from "./controllers/comments.controller";

export class CommentsModule extends BaseModule {
  constructor(app: express.Express) {
    super(app, {
      controllers: [CommentsController],
    });
  }
}