import { BaseDTO } from "@ten-kc/core";
import { IsEmail, IsOptional, IsString, ValidateNested } from "class-validator";
export class UserCredentialsInput {
  @IsString()
  provider: string;
  @IsString()
  sub: string;
  @IsString()
  secret: string;
}
export class UserProfileInput {
  @IsString()
  firstName: string;
  @IsString()
  @IsOptional()
  lastName: string;
  @IsString()
  avatar: string;
}
export class CreateUserInput extends BaseDTO {
  @IsString()
  username: string;
  @IsEmail()
  email: string;
  @ValidateNested()
  credentials: UserCredentialsInput;
  @ValidateNested()
  profile: UserProfileInput;
}