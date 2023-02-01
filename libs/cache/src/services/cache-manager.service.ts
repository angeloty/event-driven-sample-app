import { RedisClientType } from "redis";
import { ICacheConfig } from "../interfaces/cache.interfaces";
import { CacheConnectionService } from "./cache-connection.service";

export class CacheManagerService {
  clients: CacheConnectionService[];
  register({ name, ...config }: ICacheConfig) {
    name = name || "default";
    if ((this.clients || []).some((conn) => conn.name === name)) {
      return;
    }
    const client: CacheConnectionService = new CacheConnectionService({
      ...config,
      name,
    });
    client.register();
    this.clients = [...(this.clients || []), client];
    return;
  }
  getClient(workspace = "default"): RedisClientType {
    const connection: CacheConnectionService = this.clients.find(
      (con) => con.name === workspace
    );
    if (!connection) {
      throw Error(`Invalid connection`);
    }
    return connection.getClient();
  }
}