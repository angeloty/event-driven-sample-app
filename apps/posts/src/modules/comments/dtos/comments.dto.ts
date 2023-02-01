import {
  GetPaginatedListInput,
  PaginatedListOutput,
  BaseDTO,
} from "@ten-kc/core";
import { Expose, Transform, Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { PostOutput } from "../../posts/dtos/post.dto";
import { CreatorOutput } from "../../shared/dtos/creator.dto";
import { TagOutput } from "../../shared/dtos/tag.dto";
import { Comment } from "../../shared/models/comment.model";
export class GetCommentsFilterInput extends BaseDTO {
  @IsString()
  @IsOptional()
  post: string;
  @IsString()
  @IsOptional()
  text: string;
  @IsBoolean()
  @IsOptional()
  owned: boolean;
}
export class CreateCommentInput extends BaseDTO {
  @IsString()
  title: string;
  @IsString()
  content: string;
  @IsString()
  post: string;
}

export class GetCommentListInput extends GetPaginatedListInput<GetCommentsFilterInput> {}

export class CommentOutput extends BaseDTO {
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
  @Type(() => PostOutput)
  @Transform(({ value }) => {
    return typeof value === "string" ? { id: value } : value;
  })
  post: PostOutput;
  @Expose()
  @Type(() => CreatorOutput)
  @Transform(({ value }) => (typeof value === "string" ? { id: value } : value))
  creator: CreatorOutput;
}
export class DeleteCommentOutput extends BaseDTO {
  @Expose()
  success: boolean;
}
export class CommentListOutput extends PaginatedListOutput<
  GetCommentsFilterInput,
  Comment
> {}