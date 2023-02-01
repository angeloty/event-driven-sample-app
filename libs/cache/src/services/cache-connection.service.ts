import { createClient, RedisClientOptions, RedisDefaultModules } from "redis";
import type { RedisClientType } from "redis";
import { ICacheConfig } from "../interfaces/cache.interfaces";
import { Logger } from "@ten-kc/core";

export class CacheConnectionService {
  client: RedisClientType;
  constructor(private config: ICacheConfig) {}
  get name(): string {
    return this.config.name;
  }
  register(): void {
    const { host, port, db, password, user } = this.config;
    let { uri, name } = this.config;
    name = name || "default";
    if (!uri) {
      uri = `redis://`;
      if (user && password) {
        uri = `${uri}${user}:${password.replace("@", "%40")}@`;
      }
      uri = `${uri}${host || "localhost"}:${port || 27017}`;
    }
    let options: RedisClientOptions = {
      url: uri,
      database: db,
    };
    if (user && password) {
      options = { ...options, username: user, password };
    } else {
      options = { ...options };
    }
    this.client = createClient(options) as RedisClientType;
    this.client.connect();
    this.client.on("error", (err) => {
      Logger.error(`Core:Cache`, `${err.name}: ${err.message}`);
    });
    this.client.on("ready", (err) => {
      Logger.info(
        `Core:Cache`,
        `Client is Ready (${name}): ${host}:${port}/${db}`
      );
    });
    this.client.on("connect", () => {
      Logger.info(
        `Core:Cache`,
        `Connecting client (${name}): ${host}:${port}/${db}`
      );
    });
    return;
  }

  getClient(): RedisClientType {
    return this.client as RedisClientType;
  }
}