import { BaseDTO } from "@ten-kc/core";
import { Expose } from "class-transformer";
import { IsString } from "class-validator";
export class GetAuthInput extends BaseDTO {
  @IsString()
  provider: string;
  @IsString()
  sub: string;
  @IsString()
  secret: string;
}
export class GetRefreshInput extends BaseDTO {
  @IsString()
  token: string;
  @IsString()
  refresh: string;
}
export class AuthOutput extends BaseDTO {
  @Expose()
  token: string;
  @Expose()
  ttl: number;
  @Expose()
  refreshToken: string;
  @Expose()
  refreshTokenTtl: number;
}