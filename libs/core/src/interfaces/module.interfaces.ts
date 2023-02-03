import * as express from "express";
import { BaseModule } from "../module/base.module";
import { ICoreConfig } from "./app.interfaces";
import { RestControllerContructor } from "./controller.interfaces";

export interface IBaseModuleConfig extends ICoreConfig {
  controllers: RestControllerContructor[];
}
export interface IBaseModuleContructor {
  new (app: express.Express, config?: IBaseModuleConfig): BaseModule;
}
export type ModuleConstructor =
  | IBaseModuleContructor
  | Promise<IBaseModuleContructor>;