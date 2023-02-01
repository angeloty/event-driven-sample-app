import "reflect-metadata";
import { BaseRestController } from "../controller/base-rest.controller";
import {
  IControllerAttributes,
  IControllerPath,
} from "../interfaces/controller.interfaces";

export function Controller(value: string) {
  return function (constructor: Function) {
    let config: IControllerAttributes =
      Reflect.getMetadata("$_config", constructor.prototype) || {};
    config = { ...config, basePath: value || "/" };
    Reflect.defineMetadata("$_config", config, constructor.prototype);
  };
}

export interface IRequestConfig {
  middleware?: Function[];
}

export function Get(path: string, config?: IRequestConfig) {
  return function (
    target: BaseRestController,
    propertyKey: string,
    descriptor
  ) {
    addRequestHandler(target, {
      method: "get",
      path,
      name: propertyKey,
      descriptor,
      middleware: config?.middleware,
    } as IControllerPath);
  };
}

export function Post(path: string, config?: IRequestConfig) {
  return function (
    target: BaseRestController,
    propertyKey: string,
    descriptor
  ) {
    addRequestHandler(target, {
      method: "post",
      path,
      name: propertyKey,
      descriptor,
      middleware: config?.middleware,
    } as IControllerPath);
  };
}

export function Put(path: string, config?: IRequestConfig) {
  return function (
    target: BaseRestController,
    propertyKey: string,
    descriptor
  ) {
    addRequestHandler(target, {
      method: "put",
      path,
      name: propertyKey,
      descriptor,
      middleware: config?.middleware,
    } as IControllerPath);
  };
}

export function Patch(path: string, config?: IRequestConfig) {
  return function (
    target: BaseRestController,
    propertyKey: string,
    descriptor
  ) {
    addRequestHandler(target, {
      method: "patch",
      path,
      name: propertyKey,
      descriptor,
      middleware: config?.middleware,
    } as IControllerPath);
  };
}

export function Delete(path: string, config?: IRequestConfig) {
  return function (
    target: BaseRestController,
    propertyKey: string,
    descriptor
  ) {
    addRequestHandler(target, {
      method: "delete",
      path,
      name: propertyKey,
      descriptor,
      middleware: config?.middleware,
    } as IControllerPath);
  };
}

const addRequestHandler = (
  target: BaseRestController,
  pathConfig: IControllerPath
) => {
  let config: IControllerAttributes =
    Reflect.getMetadata("$_config", target.constructor.prototype) || {};
  config = {
    ...config,
    paths: [...(config.paths || []), pathConfig],
  };
  Reflect.defineMetadata("$_config", config, target.constructor.prototype);
};