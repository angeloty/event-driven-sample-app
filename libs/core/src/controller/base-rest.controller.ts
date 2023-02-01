import "reflect-metadata";
import * as express from "express";
import {
  ParamsDictionary,
  RequestHandlerParams,
} from "express-serve-static-core";
import { ParsedQs } from "qs";
import { IControllerAttributes } from "../interfaces/controller.interfaces";
import { Logger } from "../helpers/logger.helper";

export class BaseRestController {
  protected app: express.Express;
  constructor() {}
  async init(app: express.Express): Promise<express.Express> {
    this.app = app;
    Logger.info(
      `Core:Module:Controller`,
      `Registering Controller: ${this.constructor.name}`
    );
    try {
      const { basePath, paths }: IControllerAttributes =
        Reflect.getMetadata("$_config", this.constructor.prototype) || {};
      (paths || []).forEach(({ method, path, name, middleware }) => {
        let args: RequestHandlerParams<
          ParamsDictionary,
          any,
          any,
          ParsedQs,
          Record<string, any>
        >[] = [];
        if (middleware?.length) {
          args = [
            ...args,
            ...(middleware as RequestHandlerParams<
              ParamsDictionary,
              any,
              any,
              ParsedQs,
              Record<string, any>
            >[]),
          ];
        }
        args = [...args, this[name].bind(this)];
        let url = basePath;

        let prefix = url.endsWith("/") || path.startsWith("/") ? "" : "/";
        if (!path) {
          prefix = "";
          if (url.endsWith("/")) {
            url = url.substring(0, url.length - 1);
          }
        }
        const basePrefix = url.startsWith("/") ? "" : "/";
        const fullPath = `${basePrefix}${url}${prefix}${path}`;
        Logger.info(
          `Core:Module:Controller`,
          `Registering REST Endpoint => [${
            this.constructor.name
          }: ${name}] = (${method.toUpperCase()})${fullPath}`
        );
        this.app[method](fullPath, ...args);
      });
      return this.app;
    } catch (err) {
      throw err;
    }
  }
}