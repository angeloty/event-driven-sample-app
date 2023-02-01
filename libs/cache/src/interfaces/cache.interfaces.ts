import { BaseModel } from "@ten-kc/core";
import { RedisClientType } from "redis";

export interface ICacheConfig {
  uri?: string;
  name?: string;
  host: string;
  port: number | string;
  user?: string;
  password?: string;
  db?: number;
  testing?: boolean;
}

export interface ICacheConnection {
  config: ICacheConfig;
  client?: RedisClientType;
}