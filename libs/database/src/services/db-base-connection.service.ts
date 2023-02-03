import { BaseModel } from "@ten-kc/core";
import mongoose from "mongoose";
import { IDBConfig } from "../interfaces/db.interfaces";

export abstract class DBBaseConnectionService {
  connection: mongoose.Connection;
  db: mongoose.Mongoose;
  models: { [key: string]: BaseModel<any, any, any> };
  constructor(protected config: IDBConfig) {}
  abstract register(): Promise<void>;
  abstract unregister(): Promise<void>;
  abstract clean(): Promise<void>;
  abstract closeDatabase(): Promise<void>;

  abstract registerModel<T, TMethods, TVirtuals>(
    Model: new (...args) => BaseModel<T, TMethods, TVirtuals>
  ): BaseModel<T, TMethods, TVirtuals>;

  abstract getModel<M extends BaseModel<any, any, any>>(
    name: string | (new (...args) => M)
  ): M;
}