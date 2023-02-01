import {
  GetPaginatedListInput,
  PaginatedListOutput,
  BaseDTO,
} from "@ten-kc/core";
import { Expose, Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { CreatorOutput } from "../../shared/dtos/creator.dto";
import { TagOutput } from "../../shared/dtos/tag.dto";
import { Post } from "../../shared/models/post.model";
export class GetPostsFilterInput extends BaseDTO {
  @IsString()
  @IsOptional()
  text: string;
  @IsString()
  @IsOptional()
  creator: string;
  @IsBoolean()
  @IsOptional()
  owned: boolean;
}
export class MediaInput extends BaseDTO {
  @IsOptional()
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description: string;
  @IsString()
  id: string;
  @IsString()
  url: string;
}
export class MetadataInput extends BaseDTO {
  @IsString()
  attribute: string;
  @IsNotEmpty()
  value: any;
}
export class CreatePostInput extends BaseDTO {
  @IsString()
  title: string;
  @IsString()
  content: string;
  @ValidateNested()
  medias: MediaInput[];
  @ValidateNested()
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? JSON.parse(value) : value
  )
  metadata: MetadataInput[];
  @IsBoolean()
  @Transform(({ value }) =>
    typeof value === "string" ? Boolean(value) : value
  )
  isPublic: boolean;
}

export class GetPostListInput extends GetPaginatedListInput<GetPostsFilterInput> {}

export class PostMetadataOutput extends BaseDTO {
  @Expose()
  attribute: string;
  @Expose()
  value: string;
}
export class PostMediaOutput extends BaseDTO {
  @Expose()
  title: string;
  @Expose()
  description: string;
  @Expose()
  url: string;
}
export class PostOutput extends BaseDTO {
  @Expose()
  id: string;
  @Expose()
  title: string;
  @Expose()
  content: string;
  @Expose()
  @Type(() => TagOutput)
  tags: TagOutput[];
  @Expose()
  @Type(() => PostMediaOutput)
  medias: PostMediaOutput[];
  @Expose()
  @Type(() => PostMetadataOutput)
  metadata: PostMetadataOutput[];
  @Expose()
  @Type(() => CreatorOutput)
  @Transform(({ value }) => (typeof value === "string" ? { id: value } : value))
  creator: CreatorOutput;
}
export class DeletePostOutput extends BaseDTO {
  @Expose()
  success: boolean;
}
export class PostListOutput extends PaginatedListOutput<
  GetPostsFilterInput,
  Post
> {}