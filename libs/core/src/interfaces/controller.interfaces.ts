import * as express from "express";
import { BaseRestController } from "../controller/base-rest.controller";

export interface IControllerPath {
  method: "post" | "put" | "patch" | "get" | "delete";
  path: string;
  name: string;
  descriptor: PropertyDescriptor;
  middleware: Function[];
}
export interface IControllerAttributes {
  basePath: string;
  paths: IControllerPath[];
}
export interface RestControllerContructor {
  new (): BaseRestController;
}