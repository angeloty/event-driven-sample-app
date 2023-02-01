import { RedisClientType } from "redis";
import { CacheModule } from "../cache.module";

export const getCacheClient = (workspace?: string): RedisClientType => {
  return CacheModule.getClient(workspace);
};