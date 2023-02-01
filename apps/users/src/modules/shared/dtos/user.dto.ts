import {
  GetPaginatedListInput,
  PaginatedListOutput,
  BaseDTO,
} from "@ten-kc/core";
import { Expose, Type } from "class-transformer";
import { IsEmail, IsOptional, IsString } from "class-validator";
export class UserFilterInput extends BaseDTO {
  @IsEmail()
  @IsOptional()
  email?: string;
  @IsString()
  @IsOptional()
  name?: string;
}
export class UserProfileOutput extends BaseDTO {
  @Expose()
  firstName: string;
  @Expose()
  lastName: string;
  @Expose()
  avatar: string;
}
export class UserOutput extends BaseDTO {
  @Expose()
  id: string;
  @Expose()
  username: string;
  @Expose()
  email: string;
  @Expose()
  @Type(() => UserProfileOutput)
  profile: UserProfileOutput;
}
export class GetUsersInput extends GetPaginatedListInput<UserFilterInput> {}

/* OUTPUTS */
export class UserListOutput extends PaginatedListOutput<
  UserFilterInput,
  UserOutput
> {}