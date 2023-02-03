import * as mongoose from "mongoose";
import { BaseModel, Logger } from "@ten-kc/core";
import { IDBConfig } from "../interfaces/db.interfaces";
import { DBBaseConnectionService } from "./db-base-connection.service";
import { connect } from "http2";

export class DBConnectionService extends DBBaseConnectionService {
  constructor(protected config: IDBConfig) {
    super(config);
  }
  get name(): string {
    return this.config.name;
  }
  async register(): Promise<void> {
    await this.connect();
    const { host, port, dbName, name, models } = this.config;
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

  async connect() {
    const { host, port, dbName, password, user } = this.config;
    let { uri, name } = this.config;
    this.config.name = name = name || "default";
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
    if (this.db) {
      await this.db.connect(uri, options);
    } else {
      mongoose.set("strictQuery", true);
      this.db = await mongoose.connect(uri, options);
    }
    this.connection =
      this.db.connection || mongoose.createConnection(uri, options);
  }

  async unregister(): Promise<void> {
    await this.closeDatabase();
    return;
  }

  async clean(): Promise<void> {
    return;
  }
  async closeDatabase(): Promise<void> {
    await this.connection.close();
    return;
  }

  async clearDatabase(): Promise<void> {
    const collections = this.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
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