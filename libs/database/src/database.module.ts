import * as express from "express";
import "reflect-metadata";
import { BaseModel, BaseModule, IBaseModuleContructor } from "@ten-kc/core";
import { IDBConfig } from "./interfaces/db.interfaces";
import { DBManagerService } from "./services/db-manager.service";

export class DatabaseModule extends BaseModule {
  constructor(app: express.Express) {
    super(app, {
      controllers: [],
    });
  }
  static manager(db?: DBManagerService, testing = false): DBManagerService {
    db =
      db || Reflect.getMetadata("$_db", DatabaseModule.constructor.prototype);
    if (!db) {
      db = new DBManagerService();
    }
    Reflect.defineMetadata("$_db", db, DatabaseModule.constructor.prototype);
    return db;
  }
  static async register(config: IDBConfig): Promise<IBaseModuleContructor> {
    const db: DBManagerService = DatabaseModule.manager();
    db.register(config);
    DatabaseModule.manager(db);
    return DatabaseModule;
  }
  async init(app: express.Express): Promise<express.Express> {
    return this.app;
  }
  static registerModel<T, TMethods, TVirtuals>(
    Model: new (...args) => BaseModel<T, TMethods, TVirtuals>,
    dbName?: string
  ): BaseModel<T, TMethods, TVirtuals> {
    const db: DBManagerService = DatabaseModule.manager();
    const model: BaseModel<T, TMethods, TVirtuals> = db.registerModel(
      Model,
      dbName
    );
    DatabaseModule.manager(db);
    return model;
  }
  static getModel<M extends BaseModel<any, any, any>>(
    name: string | (new (...args) => M),
    dbName?: string
  ): M {
    const db: DBManagerService = DatabaseModule.manager();
    const model: M = db.getModel(name, dbName) as M;
    DatabaseModule.manager(db);
    return model;
  }
}