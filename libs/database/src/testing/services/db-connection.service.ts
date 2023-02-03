import { Logger } from "@ten-kc/core";
import * as mongoose from "mongoose";
import { IDBConfig } from "../../interfaces/db.interfaces";
import { MongoMemoryServer } from "mongodb-memory-server";
import { DBConnectionService as CoreDBConnectionService } from "../../services/db-connection.service";
let mongod: MongoMemoryServer = undefined;
const createTestConnection = async (
  dbName: string
): Promise<mongoose.Connection> => {
  try {
    Logger.info(`Core:Database`, `Testing Mode`);
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    Logger.info(`Core:Database:Connection`, `In Memory DB(${uri})`);
    const mongooseOpts: mongoose.ConnectOptions = {
      dbName,
      useNewUrlParser: true,
    } as mongoose.ConnectOptions;
    const db: mongoose.Mongoose = await mongoose.connect(uri, mongooseOpts);

    return db.connection;
  } catch (err) {
    Logger.error(`Core:Database:Connection`, `Error: ${err.message}`);
  }
};
export class DBConnectionService extends CoreDBConnectionService {
  constructor(protected config: IDBConfig) {
    super(config);
  }
  async register(): Promise<void> {
    try {
      this.config.dbName = `${this.config.dbName}-test`;
      if (process.env.IN_MEMORY_TEST) {
        const { models, dbName } = this.config;
        let { name } = this.config;
        name = name || "default";
        this.connection = await createTestConnection(dbName);

        this.connection.on("error", (err) => {
          Logger.error(
            `Core:Database:Connection`,
            `${err.name}: ${err.message}`
          );
        });
        this.connection.on("connected", () => {
          Logger.info(
            `Core:Database:Connection`,
            `In Memory DB Connected (${name})`
          );
        });
        (models || []).forEach((Model) => {
          this.registerModel(Model);
        });
        return;
      } else {
        return await super.register();
      }
    } catch (err) {
      Logger.info(`Core:Database:Connection`, `Error: (${err.message})`);
    }
  }

  async clean(): Promise<void> {
    await this.clearDatabase();
    return;
  }
  async closeDatabase() {
    await this.connection.dropDatabase();
    await this.connection.close();
    mongod && (await mongod.stop());
    return;
  }
}