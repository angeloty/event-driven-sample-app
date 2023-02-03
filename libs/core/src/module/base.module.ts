import * as express from "express";
import { BaseRestController } from "../controller/base-rest.controller";
import { Logger } from "../helpers/logger.helper";
import { IApplicationConfig, ICoreConfig } from "../interfaces/app.interfaces";
import { RestControllerContructor } from "../interfaces/controller.interfaces";
import { IBaseModuleConfig } from "../interfaces/module.interfaces";

export class BaseModule {
  protected controllers: BaseRestController[];
  constructor(
    protected app: express.Express,
    protected config: IBaseModuleConfig
  ) {}
  async init(
    app: express.Express,
    config?: ICoreConfig
  ): Promise<express.Express> {
    Logger.info(`Core:Module`, `Initializing Module: ${this.constructor.name}`);
    try {
      this.config = {
        ...(config || {}),
        ...(this.config || {}),
      } as IBaseModuleConfig;
      this.controllers = await Promise.all(
        (this.config.controllers || []).map(
          async (Constructor: RestControllerContructor) => {
            const controller: BaseRestController = new Constructor(this.config);
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
  async destroy(): Promise<void> {
    this.controllers = [];
    return;
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