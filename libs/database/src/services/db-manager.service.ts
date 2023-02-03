import { BaseModel, Logger } from "@ten-kc/core";
import { IDBConfig } from "../interfaces/db.interfaces";
import { DBConnectionService } from "./db-connection.service";
import { DBConnectionService as TestDBConnectionService } from "../testing";

export class DBManagerService {
  connections: DBConnectionService[] = [];
  constructor(private testing: boolean = false) {}
  private pendingModels: {
    [key: string]: (new (...args) => BaseModel<any, any, any>)[];
  };
  async register({ name, ...config }: IDBConfig) {
    try {
      name = name || "default";
      if ((this.connections || []).some((conn) => conn.name === name)) {
        return;
      }
      this.testing = this.testing || config?.testing;
      Logger.info(
        `Core:Database:Connection`,
        `DB Mode: ${this.testing ? "testing" : "life"}`
      );
      const connection: DBConnectionService = !this.testing
        ? new DBConnectionService({
            ...config,
            name,
          })
        : new TestDBConnectionService({
            ...config,
            name,
          });
      await connection.register();
      this.connections = [...(this.connections || []), connection];
      Logger.info(
        `Core:Database:Connection`,
        `DB Mode: Active connections(${this.connections.length})`
      );
      return;
    } catch (err) {
      Logger.error(`Core:Database:Connection`, `Error: ${err.message}`);
    }
  }
  async unregister(name?: string): Promise<void> {
    if (name) {
      const connection: DBConnectionService = (this.connections || []).find(
        (con) => con.name === name
      );
      await connection.unregister();
      return;
    } else {
      await Promise.all(
        this.connections.map(async (conn) => await conn.unregister())
      );
      return;
    }
  }
  async clean(name?: string): Promise<void> {
    if (name) {
      const connection: DBConnectionService = (this.connections || []).find(
        (con) => con.name === name
      );
      await connection.clean();
      return;
    } else {
      await Promise.all(
        this.connections.map(async (conn) => await conn.clean())
      );
      return;
    }
  }
  registerModel<T, TMethods, TVirtuals>(
    Model: new (...args) => BaseModel<T, TMethods, TVirtuals>,
    db: string = "default"
  ): BaseModel<T, TMethods, TVirtuals> {
    const connection: DBConnectionService = (this.connections || []).find(
      (con) => con.name === db
    );
    if (!connection) {
      this.pendingModels = {
        ...(this.pendingModels || {}),
        [db]: [...(this.pendingModels?.[db] || []), Model],
      };
      return;
    }
    return connection.registerModel(Model);
  }
  getModel<M extends BaseModel<any, any, any>>(
    model: string | (new (...args) => M),
    db = "default"
  ): M {
    const connection: DBConnectionService = this.connections.find(
      (con) => con.name === db
    );
    if (!connection) {
      throw Error(`Invalid connection`);
    }
    return connection.getModel<M>(model) as M;
  }
}