import {
  BadRquestException,
  BaseException,
  NotFoundException,
  UnauthorizedException,
} from "@ten-kc/core";
import { getModel } from "@ten-kc/database";
import { plainToClass } from "class-transformer";
import { decode, JwtPayload, sign, verify } from "jsonwebtoken";
import { v4 } from "uuid";
import { UserOutput } from "../../shared/dtos/user.dto";
import { User, UserModel } from "../../shared/models/user.model";
import { GetAuthInput, AuthOutput, GetRefreshInput } from "../dtos/auth.dto";
import { AuthBaseProvider } from "../providers/auth-base.provider";
import { AuthLocalProvider } from "../providers/local/auth-local.provider";

export class AuthService {
  private _provider: AuthBaseProvider;
  constructor(protected name?: string) {}

  set providerName(name: string) {
    this.name = name;
  }
  get providerName(): string {
    return this.name || "local";
  }

  get tokenKey(): string {
    return process.env.AUTH_TOKEN_SECRET_KEY || "T0k3nK3y";
  }

  get tokenTtl(): string {
    return process.env.AUTH_TOKEN_TTL || "3m";
  }

  get refreshTokenKey(): string {
    return process.env.AUTH_TOKEN_SECRET_KEY || "R3fr@shT0k3nK3y";
  }

  get refreshTokenTtl(): string {
    return process.env.AUTH_REFRESH_TOKEN_TTL || "8d";
  }

  get provider(): AuthBaseProvider {
    if (!this._provider) {
      this._provider = this.createProvider(this.name);
    }
    return this._provider;
  }
  private createProvider(provider: string): AuthBaseProvider {
    switch (provider) {
      case "local":
        return new AuthLocalProvider();
      default:
        return new AuthLocalProvider();
    }
  }

  async login(params: GetAuthInput): Promise<AuthOutput> {
    try {
      params = plainToClass(GetAuthInput, params);
      await params.validate();
      const { sub, provider } = params;
      const model: UserModel = getModel(UserModel);
      const user: User = await model
        .findOne({
          "credentials.provider": provider,
          "credentials.sub": sub,
        })
        .exec();
      if (!user) {
        throw new NotFoundException(
          `User(${sub})not found for provider "${provider}"`
        );
      }
      if (!(await this.provider.validate(user, params))) {
        throw new UnauthorizedException(
          `Invalid credentials for User(${sub}) and provider "${provider}"`
        );
      }
      return this.createTokens(user, params);
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new UnauthorizedException(err.message);
    }
  }

  async refresh(params: GetRefreshInput): Promise<AuthOutput> {
    try {
      params = plainToClass(GetRefreshInput, params);
      await params.validate();
      const { token, refresh } = params;
      const { key } = verify(refresh, this.refreshTokenKey) as JwtPayload;
      if (!key) {
        throw new Error(`Invalid Token`);
      }
      const { sub, provider, ...decoded } = decode(token, { json: true }) || {};
      if (key !== decoded?.key) {
        throw new BadRquestException(`Signature doesn't match`);
      }
      const model: UserModel = getModel(UserModel);
      const user: User = await model
        .findOne({
          "credentials.provider": provider,
          "credentials.sub": sub,
        })
        .exec();
      if (!user) {
        throw new NotFoundException(
          `User(${sub})not found for provider "${provider}"`
        );
      }
      return this.createTokens(user, { sub, provider } as GetAuthInput);
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new UnauthorizedException(err.message);
    }
  }

  async getUserByToken(
    token: string,
    asOutput = false
  ): Promise<User | UserOutput> {
    try {
      const { sub, provider, id } =
        (verify(token, this.tokenKey) as JwtPayload) || {};
      if (!sub || !id || !provider) {
        throw new UnauthorizedException(`Invalid Token`);
      }
      const model: UserModel = getModel(UserModel);
      const user: User = await model
        .findOne({
          id,
          "credentials.provider": provider,
          "credentials.sub": sub,
        })
        .exec();
      if (!user) {
        throw new UnauthorizedException(
          `User(${id} => ${sub})not found for provider "${provider}"`
        );
      }
      if (asOutput) {
        return model.toResponse<UserOutput>(UserOutput, user);
      }
      return user;
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new UnauthorizedException(err.message);
    }
  }

  private createTokens(
    user: User,
    { sub, provider }: GetAuthInput
  ): AuthOutput {
    const refreshPayload = {
      key: v4(),
    };
    const payload = {
      ...refreshPayload,
      id: user.id,
      sub,
      provider,
    };
    const ttl = process.env.AUTH_TOKEN_TTL || "3m";
    const token = sign(payload, this.tokenKey, {
      expiresIn: ttl,
    });

    const refreshTokenTtl = this.refreshTokenTtl;
    const refreshToken = sign(refreshPayload, this.refreshTokenKey, {
      expiresIn: refreshTokenTtl,
    });
    return plainToClass(AuthOutput, {
      ttl,
      token,
      refreshToken,
      refreshTokenTtl,
    });
  }
}