import {
  BadRquestException,
  BaseException,
  NotFoundException,
  UnauthorizedException,
} from "@ten-kc/core";
import { plainToClass, plainToInstance } from "class-transformer";
import e = require("express");
import * as mongoose from "mongoose";
import { getModel } from "../../../../../../libs/database/src/helpers/database.helper";
import { PostService } from "../../posts/services/post.service";
import { CreatorOutput } from "../../shared/dtos/creator.dto";
import {
  Comment,
  CommentModel,
  CommentStaticMethods,
} from "../../shared/models/comment.model";
import { Post, PostModel } from "../../shared/models/post.model";
import { UserService } from "../../shared/services/user.service";
import {
  CommentListOutput,
  CommentOutput,
  CreateCommentInput,
  DeleteCommentOutput,
  GetCommentListInput,
  GetCommentsFilterInput,
} from "../dtos/comments.dto";

export class CommentsService {
  constructor() {}
  async getComments(
    user: CreatorOutput,
    params: GetCommentListInput
  ): Promise<CommentListOutput> {
    try {
      if (!user) {
        throw new UnauthorizedException(`Unauthorized`);
      }
      params = plainToClass(GetCommentListInput, params);
      await params.validate();
      const { skip, limit } = params;
      let { filter, sort } = params;
      const { owned, text, post } = (filter || {}) as GetCommentsFilterInput;
      let query: mongoose.FilterQuery<Comment> = {};
      if (owned) {
        query = {
          ...query,
          creator: user.id,
        };
      }
      if (post) {
        const postService: PostService = new PostService();
        const postDoc: Post = (await postService.getPost(
          user,
          post,
          true
        )) as Post;
        query = {
          ...query,
          post: postDoc["_id"],
        };
      }
      if (text) {
        query = {
          ...query,
          $or: [
            {
              title: { $regex: new RegExp(text, "i") },
            },
            {
              content: { $regex: new RegExp(text, "i") },
            },
          ],
        };
      }
      sort = sort || { username: -1 };
      const model: CommentModel = getModel(CommentModel);
      const result: Comment[] = await model
        .find(query)
        .populate("post")
        .skip(skip || 0)
        .limit(limit || 50)
        .sort(sort)
        .exec();
      const total: number = await model.count(query).exec();
      const userService: UserService = new UserService();
      const creatorIds: string[] = result.map(
        (comment: Comment) => comment.creator
      );
      const creators: CreatorOutput[] = await userService.getUserByIds(
        creatorIds
      );
      const data: CommentOutput[] = result.map((comment: Comment) =>
        model.toResponse(CommentOutput, comment, {
          creator:
            creators.find((c: CreatorOutput) => c.id === comment.creator) ||
            ({ id: comment.creator } as CreatorOutput),
        })
      );
      return plainToInstance(CommentListOutput, {
        total,
        data,
        params,
      });
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new BadRquestException(err.message);
    }
  }

  async getComment(user: CreatorOutput, id: string): Promise<CommentOutput> {
    try {
      if (!user) {
        throw new UnauthorizedException(`Unauthorized`);
      }
      const model: CommentModel = getModel(CommentModel);
      const comment: Comment = await model.findById(id).populate("post").exec();
      if (!comment) {
        throw new NotFoundException(`Comment(${id}) not found.`);
      }
      const userService: UserService = new UserService();
      const creator: CreatorOutput = await userService.getUserById(
        comment.creator
      );
      return model.toResponse<CommentOutput>(CommentOutput, comment, {
        creator,
      });
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new BadRquestException(err.message);
    }
  }

  async createComment(
    user: CreatorOutput,
    data: CreateCommentInput
  ): Promise<CommentOutput> {
    try {
      data = plainToClass(CreateCommentInput, data);
      await data.validate();
      const { title, content, post } = data;
      const model: CommentModel = getModel(CommentModel);
      const postService: PostService = new PostService();
      const postDoc: Post = (await postService.getPost(
        user,
        post,
        true
      )) as Post;
      let comment: Comment & CommentStaticMethods = model.create({
        title,
        content,
        creator: user.id,
        post: postDoc,
        createdAt: new Date(),
      });
      comment.processTags();
      comment = await model.insert(comment);
      return await this.getComment(user, comment.id);
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new BadRquestException(err.message);
    }
  }

  async deleteComment(
    user: CreatorOutput,
    id: string
  ): Promise<DeleteCommentOutput> {
    try {
      if (!user) {
        throw new UnauthorizedException(`Unauthorized`);
      }
      const model: CommentModel = getModel(CommentModel);
      const comment: Comment = await model
        .findOneAndDelete({
          id,
          creator: user.id,
        })
        .exec();
      if (!comment) {
        throw new NotFoundException(`Comment(${id}) not found.`);
      }
      return new DeleteCommentOutput({ success: true });
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new BadRquestException(err.message);
    }
  }
}