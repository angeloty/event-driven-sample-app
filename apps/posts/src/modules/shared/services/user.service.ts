import { getCacheClient as getPubSub, PubSub } from "@ten-kc/cache";
import { v4 } from "uuid";
import {
  Logger,
  PubSubErrorResponse,
  PubSubPayload,
  PubSubResponse,
} from "@ten-kc/core";
import { CreatorOutput } from "../dtos/creator.dto";
export enum AUTH_PUB_EVENTS {
  TOKEN = "10kc:auth:get",
}
export enum AUTH_SUB_EVENTS {
  TOKEN = "10kc:auth:get:{requestId}:data",
  TOKEN_ERROR = "10kc:auth:get:{requestId}:error",
}
export enum USER_PUB_EVENTS {
  LIST = "10kc:user:list",
  GET = "10kc:user:get",
}
export enum USER_SUB_EVENTS {
  LIST = "10kc:user:list:{requestId}:data",
  LIST_ERROR = "10kc:user:list:{requestId}",
  GET = "10kc:user:get:{requestId}:data",
  GET_ERROR = "10kc:user:get:{requestId}:error",
}
interface SubscriptionParams<P> {
  event: string;
  success: string;
  error: string;
  params: P;
}
export class UserService {
  constructor() {}
  private async subscribe<PayloadD, Output>({
    event,
    success,
    error,
    params,
  }: SubscriptionParams<PayloadD>): Promise<Output> {
    try {
      const requestId = v4();
      [event, success, error] = [event, success, error].map((evt) =>
        evt.replace("{requestId}", requestId)
      );
      const pubSub = new PubSub();
      await pubSub.init();
      const disconnect = async () => {
        try {
          await pubSub.close();
          return;
        } catch (err) {
          Logger.error(`Post:UserService`, err);
          return;
        }
      };

      const payload: PubSubPayload<PayloadD> = {
        requestId,
        data: params,
      };
      await pubSub.publish<PayloadD>(event, payload);
      let done = false;
      return new Promise<Output>((resolve, reject) => {
        pubSub.subscribe<Output>(
          success,
          async (output: PubSubResponse<Output>) => {
            done = true;
            const { data }: PubSubResponse<Output> = output;
            resolve(data);
            await disconnect();
            return;
          }
        );
        pubSub.subscribe(error, async (err: PubSubErrorResponse) => {
          done = true;
          const { error }: PubSubErrorResponse = err;
          reject(error);
          await disconnect();
          return;
        });
        setTimeout(async () => {
          if (!done) {
            done = true;
            reject(new Error(`Request Timeout`));
            await disconnect();
            return;
          }
        }, 30000);
      });
    } catch (err) {
      throw err;
    }
  }
  async getUserByToken(token: string): Promise<CreatorOutput> {
    try {
      if (!token) {
        throw new Error(`Unauthorized`);
      }
      return await this.subscribe<{ token: string }, CreatorOutput>({
        event: AUTH_PUB_EVENTS.TOKEN,
        params: {
          token,
        },
        success: AUTH_SUB_EVENTS.TOKEN,
        error: AUTH_SUB_EVENTS.TOKEN_ERROR,
      });
    } catch (err) {
      throw err;
    }
  }
  async getUserByIds(ids: string[]): Promise<CreatorOutput[]> {
    try {
      if (!ids?.length) {
        return [];
      }
      return await this.subscribe<{ ids: string[] }, CreatorOutput[]>({
        event: USER_PUB_EVENTS.LIST,
        params: {
          ids,
        },
        success: USER_SUB_EVENTS.LIST,
        error: USER_SUB_EVENTS.LIST_ERROR,
      });
    } catch (err) {
      throw err;
    }
  }
  async getUserById(id: string): Promise<CreatorOutput> {
    try {
      if (!id) {
        return null;
      }
      return await this.subscribe<{ id: string }, CreatorOutput>({
        event: USER_PUB_EVENTS.GET,
        params: {
          id,
        },
        success: USER_SUB_EVENTS.GET,
        error: USER_SUB_EVENTS.GET_ERROR,
      });
    } catch (err) {
      throw err;
    }
  }
}