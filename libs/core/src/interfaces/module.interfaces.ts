import * as express from "express";
import { BaseModule } from "../module/base.module";
export interface IBaseModuleContructor {
  new (app: express.Express): BaseModule;
}
export type ModuleConstructor =
  | IBaseModuleContructor
  | Promise<IBaseModuleContructor>;