import * as express from "express";
import { BaseModule } from "@ten-kc/core";

export class FilesModule extends BaseModule {
  constructor(app: express.Express) {
    super(app, {
      controllers: [],
    });
  }
}