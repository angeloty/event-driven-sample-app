import {
  Logger,
  PubSubErrorResponse,
  PubSubPayload,
  PubSubResponse,
} from "@ten-kc/core";
import { RedisClientType } from "redis";
import { getCacheClient } from "./cache.helper";

interface CustomRedisClient extends RedisClientType {
  connected: boolean;
}

export class PubSub {
  protected name: string;
  protected pub: CustomRedisClient;
  protected sub: CustomRedisClient;
  constructor(name?: string) {
    this.name = name;
    this.pub = getCacheClient().duplicate() as CustomRedisClient;
    this.sub = getCacheClient().duplicate() as CustomRedisClient;
  }

  async init() {
    [this.pub, this.sub] = await Promise.all(
      [this.pub, this.sub].map(async (client, index) => {
        try {
          client.on("ready", () => {
            Logger.info(
              `Core:Cache:PubSub`,
              `[${index ? "Subscriber" : "Publisher"}] Connection Ready`
            );
            client.connected = true;
          });
          client.on("error", (err) => {
            Logger.error(
              `Core:Cache:PubSub`,
              `[${
                index ? "Subscriber" : "Publisher"
              }] Connection Ready. Error(${err.message || err})`
            );
            client.connected = false;
          });
          client.on("end", () => {
            Logger.info(
              `Core:Cache:PubSub`,
              `[${index ? "Subscriber" : "Publisher"}] Connection Close`
            );
            client.connected = false;
          });
          await client.connect();
          return client;
        } catch (err) {
          Logger.error(`Core:Cache:PubSub`, `${err.message}`);
          return;
        }
      })
    );
  }

  async close() {
    await Promise.all(
      [this.pub, this.sub].map(async (client) => {
        try {
          if (client.connected || (await client.ping())) {
            await client.quit();
          }
          return client;
        } catch (err) {
          Logger.error(`Core:Cache:PubSub`, `${err.message}`);
          return;
        }
      })
    );
  }

  async publish<T>(event: string, message: PubSubPayload<T>) {
    Logger.info(
      `Core:Cache:PubSub`,
      `[Publisher] Publishing message (Topic: "${event}")`
    );
    return this.pub.publish(event, JSON.stringify(message));
  }

  async error(event: string, message: PubSubErrorResponse) {
    Logger.error(
      `Core:Cache:PubSub`,
      `[Publisher] Publishing error (Topic: "${event}")`
    );
    return this.pub.publish(event, JSON.stringify(message));
  }

  async subscribe<T>(
    event: string,
    listener: (data: PubSubResponse<T> | PubSubErrorResponse) => void
  ) {
    Logger.info(
      `Core:Cache:PubSub`,
      `[Subscriber] Creating topic subscription (Topic: "${event}")`
    );
    return this.sub.subscribe(event, async (message: string | Buffer) => {
      Logger.info(
        `Core:Cache:PubSub`,
        `[Subscriber] Receiving message (Topic: "${event}")`
      );
      message = message instanceof Buffer ? message.toString("utf-8") : message;
      await listener(
        JSON.parse(message) as PubSubResponse<T> | PubSubErrorResponse
      );
    });
  }
}