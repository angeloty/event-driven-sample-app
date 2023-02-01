import * as express from "express";
import "reflect-metadata";
import { BaseModule, IBaseModuleContructor } from "@ten-kc/core";
import { CacheManagerService } from "./services/cache-manager.service";
import { ICacheConfig } from "./interfaces/cache.interfaces";
import { RedisClientType } from "redis";

export class CacheModule extends BaseModule {
  constructor(app: express.Express) {
    super(app, {
      controllers: [],
    });
  }
  static manager(cache?: CacheManagerService): CacheManagerService {
    cache =
      cache ||
      Reflect.getMetadata("$_cache", CacheModule.constructor.prototype);
    if (!cache) {
      cache = new CacheManagerService();
    }
    Reflect.defineMetadata("$_cache", cache, CacheModule.constructor.prototype);
    return cache;
  }
  static register(config: ICacheConfig): IBaseModuleContructor {
    const cache: CacheManagerService = CacheModule.manager();
    cache.register(config);
    CacheModule.manager(cache);
    return CacheModule;
  }
  async init(app: express.Express): Promise<express.Express> {
    return this.app;
  }
  static getClient(workspace?: string): RedisClientType {
    const cache: CacheManagerService = CacheModule.manager();
    const client: RedisClientType = cache.getClient(workspace);
    CacheModule.manager(cache);
    return client;
  }
}