import { Connection } from "mongoose";
import { BaseModel } from "@ten-kc/core";

export interface IDBConfig {
  uri?: string;
  name?: string;
  host: string;
  port: number | string;
  user?: string;
  password?: string;
  dbName?: string;
  testing?: boolean;
  models?: (new (...args) => BaseModel<any, any, any>)[];
}

export interface IDBConnection {
  config: IDBConfig;
  connection?: Connection;
  models?: { [key: string]: BaseModel<any, any, any> };
}