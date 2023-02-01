import * as mongoose from "mongoose";
import { BaseModel, Logger } from "@ten-kc/core";
import { IDBConfig } from "../interfaces/db.interfaces";

export class DBConnectionService {
  connection: mongoose.Connection;
  models: { [key: string]: BaseModel<any, any, any> };
  constructor(protected config: IDBConfig) {}
  get name(): string {
    return this.config.name;
  }
  async register(): Promise<void> {
    const { host, port, dbName, password, user, models } = this.config;
    let { uri, name } = this.config;
    name = name || "default";
    let options: mongoose.ConnectOptions = {
      dbName,
    };
    if (!uri) {
      uri = `mongodb://`;
      if (user && password) {
        uri = `${uri}${user}:${password.replace("@", "%40")}@`;
      }
      uri = `${uri}${host || "localhost"}:${port || 27017}/${dbName || "db"}`;
    }
    if (user && password) {
      options = { ...options, user, pass: password };
    }
    this.connection = mongoose.createConnection(uri, options);
    this.connection.on("error", (err) => {
      Logger.error(`Core:Database:Connection`, `${err.name}: ${err.message}`);
    });
    this.connection.on("connected", () => {
      Logger.info(
        `Core:Database:Connection`,
        `DB Connected (${name}): ${host}:${port}/${dbName}`
      );
    });
    (models || []).forEach((Model) => {
      this.registerModel(Model);
    });
    return;
  }

  registerModel<T, TMethods, TVirtuals>(
    Model: new (...args) => BaseModel<T, TMethods, TVirtuals>
  ): BaseModel<T, TMethods, TVirtuals> {
    let model = new Model();
    if ((model = this.models?.[model.name])) {
      return model;
    }

    model = new Model();
    model.register(this.connection);
    this.models = { ...(this.models || {}), [model.name]: model };
    return this.getModel<BaseModel<T, TMethods, TVirtuals>>(model.name);
  }

  getModel<M extends BaseModel<any, any, any>>(
    name: string | (new (...args) => M)
  ): M {
    if (!this.models) {
      return null;
    }
    if (typeof name === "string") {
      return this.models[name] as M;
    }
    const key = Object.keys(this.models || {}).find(
      (k) => this.models[k].constructor.name === name.name
    );
    return this.getModel(key);
  }
}