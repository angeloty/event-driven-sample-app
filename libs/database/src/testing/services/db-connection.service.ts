import { BaseModel, Logger } from "@ten-kc/core";
import * as mongoose from "mongoose";
import { IDBConfig } from "../../interfaces/db.interfaces";
import { MongoMemoryServer } from "mongodb-memory-server";
import { DBConnectionService as CoreDBConnectionService } from "../../services/db-connection.service";
let mongod = undefined;
const createConnection = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  const mongooseOpts: mongoose.ConnectOptions = {};

  return mongoose.createConnection(uri, mongooseOpts);
};
export class DBConnectionService extends CoreDBConnectionService {
  connection: mongoose.Connection;
  models: { [key: string]: BaseModel<any, any, any> };
  constructor(protected config: IDBConfig) {
    super(config);
  }
  get name(): string {
    return this.config.name;
  }
  async register(): Promise<void> {
    const { host, port, dbName, password, user, models } = this.config;
    let { uri, name } = this.config;
    name = name || "default";
    this.connection = await createConnection();
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
}