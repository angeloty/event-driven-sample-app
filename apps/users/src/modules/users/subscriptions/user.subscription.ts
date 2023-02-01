import { getCacheClient as getPubSub, PubSub } from "@ten-kc/cache";
import {
  Logger,
  PubSubErrorResponse,
  PubSubPayload,
  PubSubResponse,
} from "@ten-kc/core";
import { UserOutput } from "../../shared/dtos/user.dto";
import { UserService } from "../services/user.service";
export enum USER_SUB_EVENTS {
  LIST = "10kc:user:list",
  GET = "10kc:user:get",
}
export enum USER_PUB_EVENTS {
  LIST = "10kc:user:list:{requestId}:data",
  LIST_ERROR = "10kc:user:list:{requestId}",
  GET = "10kc:user:get:{requestId}:data",
  GET_ERROR = "10kc:user:get:{requestId}:error",
}
export class UserSubscriptions {
  static async register() {
    try {
      const pubSub: PubSub = new PubSub();
      await pubSub.init();
      pubSub.subscribe<{ id: string }>(
        USER_SUB_EVENTS.GET,
        async (input: PubSubPayload<{ id: string }>) => {
          const {
            requestId,
            data: { id },
          }: PubSubPayload<{ id: string }> = input;
          try {
            const service: UserService = new UserService();
            const user: UserOutput = await service.getUserById(id);
            const data: PubSubResponse<UserOutput> = {
              requestId,
              data: { ...user } as UserOutput,
            };
            const event: string = USER_PUB_EVENTS.GET.replace(
              "{requestId}",
              requestId
            );
            await pubSub.publish<UserOutput>(event, { ...data });
          } catch (err) {
            const error: PubSubErrorResponse = {
              requestId,
              error: { ...err },
            };
            const event: string = USER_PUB_EVENTS.GET_ERROR.replace(
              "{requestId}",
              requestId
            );
            await pubSub.error(event, { ...error });
          }
        }
      );
      pubSub.subscribe<{ ids: string[] }>(
        USER_SUB_EVENTS.LIST,
        async (input: PubSubPayload<{ ids: string[] }>) => {
          const {
            requestId,
            data: { ids },
          }: PubSubPayload<{ ids: string[] }> = input;
          try {
            const service: UserService = new UserService();
            const users: UserOutput[] = await service.getUserByIds(ids);
            const data: PubSubResponse<UserOutput[]> = {
              requestId,
              data: users,
            };
            const event: string = USER_PUB_EVENTS.LIST.replace(
              "{requestId}",
              requestId
            );
            await pubSub.publish<UserOutput[]>(event, { ...data });
          } catch (err) {
            const error: PubSubErrorResponse = {
              requestId,
              error: { ...err },
            };
            const event: string = USER_PUB_EVENTS.LIST_ERROR.replace(
              "{requestId}",
              requestId
            );
            await pubSub.error(event, { ...error });
          }
        }
      );
    } catch (err) {
      Logger.error(`User:Subscription`, err.message);
    }
  }
}