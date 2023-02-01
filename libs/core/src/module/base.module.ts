import * as express from "express";
import { BaseRestController } from "../controller/base-rest.controller";
import { Logger } from "../helpers/logger.helper";
import { RestControllerContructor } from "../interfaces/controller.interfaces";

export interface IBaseModuleConfig {
  controllers: RestControllerContructor[];
}
export class BaseModule {
  protected controllers: BaseRestController[];
  constructor(
    protected app: express.Express,
    protected config: IBaseModuleConfig
  ) {}
  async init(app: express.Express): Promise<express.Express> {
    Logger.info(`Core:Module`, `Initializing Module: ${this.constructor.name}`);
    try {
      this.controllers = await Promise.all(
        (this.config.controllers || []).map(
          async (Constructor: RestControllerContructor) => {
            const controller: BaseRestController = new Constructor();
            try {
              app = await controller.init(app);
              return controller;
            } catch (e) {
              Logger.error(
                `Core:Module`,
                `Error(${Constructor.name}): ${e.message}`
              );
            }
          }
        )
      );

      return app;
    } catch (err) {
      throw err;
    }
  }
  getController<C extends BaseRestController>(
    name: string | (new (...args) => C)
  ): C {
    const controllerName = typeof name === "string" ? name : name.name;
    return this.controllers.find(
      (controller) => controller.constructor.name === controllerName
    ) as C;
  }
}