import * as bodyParser from "body-parser";
import * as express from "express";
import "reflect-metadata";
import {
  EventCallbackFnType,
  EventManager,
  IEventCallbackConfig,
} from "./helpers/event.helper";
import { Logger } from "./helpers/logger.helper";
import { IApplicationConfig } from "./interfaces/app.interfaces";
import { IBaseModuleContructor } from "./interfaces/module.interfaces";
import { BaseModule } from "./module/base.module";

export class Application {
  instances: BaseModule[];
  private readonly event: EventManager = new EventManager();
  constructor(
    private app: express.Express,
    private modules: (IBaseModuleContructor | Promise<IBaseModuleContructor>)[],
    private config?: IApplicationConfig
  ) {
    if (this.config?.testing) {
      Logger.constructor.prototype.testing = true;
    }
    this.event.create("ready", { type: "single" });
  }
  get application() {
    return this.app;
  }

  async init(port: number | string = 80) {
    try {
      this.app.use(bodyParser.json());
      this.instances = await Promise.all(
        this.modules.map(
          async (
            ModuleConstructor:
              | IBaseModuleContructor
              | Promise<IBaseModuleContructor>
          ) => {
            try {
              const Module = await ModuleConstructor;
              const module: BaseModule = new Module(this.app);
              this.app = await module.init(this.app);
              return module;
            } catch (err) {
              Logger.error(`Core:App`, `Error creating Module: ${err.message}`);
              throw err;
            }
          }
        )
      );
      if (!this.config?.testing) {
        port = Number(port || 80);
        Logger.info(`Core:App`, `Running App on Port: ${port}`);
        await this.app.listen(port);
      }

      Logger.log(`Core:App`, `Platform Ready`);
      this.emit("ready", this);
    } catch (err) {
      Logger.error(`Core:App`, `Error: ${err.message}`);
    }
  }

  async destroy(): Promise<any> {
    return await Promise.all(
      this.instances.map(async (module: BaseModule) => await module.destroy())
    );
  }
  async ready(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.once("ready", resolve, { emitIfTriggered: true });
    });
  }
  on(
    evt: string,
    callback: EventCallbackFnType,
    config?: IEventCallbackConfig
  ) {
    return this.event.on(evt, callback, config);
  }
  once(
    evt: string,
    callback: EventCallbackFnType,
    config?: IEventCallbackConfig
  ) {
    return this.event.once(evt, callback, config);
  }
  emit(evt: string, ...params: any[]) {
    return this.event.emit(evt, ...params);
  }

  getModule<T extends BaseModule>(name: string | (new (...args) => T)): T {
    const moduleName = typeof name === "string" ? name : name.name;
    return this.instances.find(
      (module) => module.constructor.name === moduleName
    ) as T;
  }
}