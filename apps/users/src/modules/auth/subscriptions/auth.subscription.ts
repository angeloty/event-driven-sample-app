import { getCacheClient as getPubSub, PubSub } from "@ten-kc/cache";
import {
  Logger,
  PubSubErrorResponse,
  PubSubPayload,
  PubSubResponse,
} from "@ten-kc/core";
import { AuthService } from "../../auth/services/auth.service";
import { UserOutput } from "../../shared/dtos/user.dto";
export enum AUTH_SUB_EVENTS {
  TOKEN = "10kc:auth:get",
}
export enum AUTH_PUB_EVENTS {
  TOKEN = "10kc:auth:get:{requestId}:data",
  TOKEN_ERROR = "10kc:auth:get:{requestId}:error",
}
export class AuthSubscriptions {
  static async register() {
    try {
      const pubSub: PubSub = new PubSub();
      await pubSub.init();
      pubSub.subscribe<{ token: string }>(
        AUTH_SUB_EVENTS.TOKEN,
        async (input: PubSubPayload<{ token: string }>) => {
          const {
            requestId,
            data: { token },
          }: PubSubPayload<{ token: string }> = input;
          try {
            const service: AuthService = new AuthService();
            const user: UserOutput = (await service.getUserByToken(
              token,
              true
            )) as UserOutput;
            const data: PubSubResponse<UserOutput> = {
              requestId,
              data: { ...user } as UserOutput,
            };
            const event: string = AUTH_PUB_EVENTS.TOKEN.replace(
              "{requestId}",
              requestId
            );
            await pubSub.publish<UserOutput>(event, { ...data });
          } catch (err) {
            const event = AUTH_PUB_EVENTS.TOKEN_ERROR.replace(
              "{requestId}",
              requestId
            );
            const error: PubSubErrorResponse = {
              requestId,
              error: { ...err },
            };
            await pubSub.error(event, { ...error });
          }
        }
      );
    } catch (err) {
      Logger.error(`User:Auth:Subscription`, err.message);
    }
  }
}