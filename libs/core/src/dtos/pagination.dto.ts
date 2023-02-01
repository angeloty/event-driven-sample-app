import { Expose, Transform, Type } from "class-transformer";
import { IsNumber, IsOptional, ValidateNested } from "class-validator";
import { SortOrder } from "mongoose";
import { BaseDTO } from "./common.dto";

export class GetPaginatedListInput<T> extends BaseDTO {
  @IsNumber()
  @Expose()
  @Transform(({ value }) => Number(value || 0))
  skip: number;
  @IsNumber()
  @Expose()
  @Transform(({ value }) => Number(value || 10))
  limit: number;
  @IsOptional()
  @Expose()
  sort?: { [attr: string]: SortOrder };
  @IsOptional()
  @Expose()
  filter?: Partial<T> | { [attr: string]: any };
}

export class PaginatedListOutput<F, T> extends BaseDTO {
  @Expose()
  total: number;
  @Expose()
  data: T[];
  @Expose()
  @Type(() => GetPaginatedListInput<T>)
  params: GetPaginatedListInput<F>;
}