import { BaseDTO } from "@ten-kc/core";
import { Expose, Type } from "class-transformer";

export class CreatorProfileOutput extends BaseDTO {
  @Expose()
  firstName: string;
  @Expose()
  lastName: string;
  @Expose()
  avatar: string;
}
export class CreatorOutput extends BaseDTO {
  @Expose()
  id: string;
  @Expose()
  username: string;
  @Expose()
  email: string;
  @Expose()
  @Type(() => CreatorProfileOutput)
  profile: CreatorProfileOutput;
}