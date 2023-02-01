import * as bodyParser from "body-parser";
import * as express from "express";
import { Logger } from "./helpers/logger.helper";
import { IBaseModuleContructor } from "./interfaces/module.interfaces";
import { BaseModule } from "./module/base.module";
export class Application {
  instances: BaseModule[];
  constructor(
    private app: express.Express,
    private modules: (IBaseModuleContructor | Promise<IBaseModuleContructor>)[]
  ) {}
  async init(port: number | string = 80, testing = false) {
    try {
      this.app.use(bodyParser.json());
      this.instances = await Promise.all(
        this.modules.map(
          async (
            ModuleConstructor:
              | IBaseModuleContructor
              | Promise<IBaseModuleContructor>
          ) => {
            const Module = await ModuleConstructor;
            try {
              const module: BaseModule = new Module(this.app);
              this.app = await module.init(this.app);
              return module;
            } catch (err) {
              Logger.error(`Core:App`, `Error(${Module.name}): ${err.message}`);
              throw err;
            }
          }
        )
      );
      port = Number(port || 80);
      Logger.info(`Core:App`, `Running App on Port: ${port}`);
      if (!testing) {
        await this.app.listen(port);
      }
    } catch (err) {
      Logger.error(`Core:App`, `Error: ${err.message}`);
    }
  }

  getModule<T extends BaseModule>(name: string | (new (...args) => T)): T {
    const moduleName = typeof name === "string" ? name : name.name;
    return this.instances.find(
      (module) => module.constructor.name === moduleName
    ) as T;
  }
}