import { BaseDTO } from "@ten-kc/core";
import { Expose } from "class-transformer";

export class TagOutput extends BaseDTO {
  @Expose()
  name: string;
  @Expose()
  type: string;
  @Expose()
  link: string;
}