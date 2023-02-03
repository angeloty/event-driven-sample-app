import {
  BadRquestException,
  BaseException,
  NotFoundException,
} from "@ten-kc/core";
import { plainToClass, plainToInstance } from "class-transformer";
import { Response } from "express";
import { FilterQuery } from "mongoose";
import { getModel } from "../../../../../../libs/database/src/helpers/database.helper";
import { FileService } from "../../files/services/file.service";
import { CreatorOutput } from "../../shared/dtos/creator.dto";
import {
  AuthRequest,
  FileUploadRequest,
  IFile,
} from "../../shared/dtos/request.dto";
import {
  Post,
  PostModel,
  PostStaticMethods,
} from "../../shared/models/post.model";
import { UserService } from "../../shared/services/user.service";
import {
  CreatePostInput,
  DeletePostOutput,
  GetPostListInput,
  GetPostsFilterInput,
  MediaInput,
  PostListOutput,
  PostOutput,
} from "../dtos/post.dto";

export class PostService {
  constructor() {}
  async getPosts(
    user: CreatorOutput,
    params: GetPostListInput
  ): Promise<PostListOutput> {
    try {
      if (!user) {
        throw new Error(`Unauthorized`);
      }
      params = plainToClass(GetPostListInput, params);
      await params.validate();
      const { skip, limit } = params;
      let { filter, sort } = params;
      const { creator, owned, text } = (filter || {}) as GetPostsFilterInput;
      let query: FilterQuery<Post> = {
        $or: [
          {
            isPublic: true,
          },
          {
            creator: user.id,
          },
        ],
      };
      if (owned) {
        query = {
          ...query,
          creator: user.id,
        };
      }
      if (creator) {
        query = {
          ...query,
          creator,
          ...(creator !== user.id ? { isPublic: true } : {}),
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
            {
              "medias.title": { $regex: new RegExp(text, "i") },
            },
            {
              "metadata.value": { $regex: new RegExp(text, "i") },
            },
          ],
        };
      }
      sort = sort || { createdAt: -1 };
      const model: PostModel = getModel(PostModel);
      const result: Post[] = await model
        .find(query)
        .skip(skip || 0)
        .limit(limit || 50)
        .sort(sort)
        .exec();
      const total: number = await model.count(query).exec();
      const userService: UserService = new UserService();
      const creatorIds: string[] = result.map((post: Post) => post.creator);
      const creators: CreatorOutput[] = await userService.getUserByIds(
        creatorIds
      );
      const data: PostOutput[] = result.map((post: Post) =>
        model.toResponse(PostOutput, post, {
          creator:
            creators.find((c: CreatorOutput) => c.id === post.creator) ||
            ({ id: post.creator } as CreatorOutput),
        })
      );
      return plainToInstance(PostListOutput, {
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

  async getPost(
    user: CreatorOutput,
    id: string,
    asDocument = false
  ): Promise<PostOutput | Post> {
    try {
      if (!user) {
        throw new Error(`Unauthorized.`);
      }
      const model: PostModel = getModel(PostModel);
      const post: Post = await model.findById(id).exec();
      if (!post) {
        throw new NotFoundException(`Post(${id}) not found.`);
      }
      if (asDocument) {
        return post;
      }
      const userService: UserService = new UserService();
      const creator: CreatorOutput = await userService.getUserById(
        post.creator
      );
      return model.toResponse<PostOutput>(PostOutput, post, { creator });
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new BadRquestException(err.message);
    }
  }

  async createPostWithFile(
    user: CreatorOutput,
    data: CreatePostInput,
    files: IFile[]
  ): Promise<PostOutput> {
    try {
      const fileService = new FileService();
      const post: Post = (await this.createPost(user, data, true)) as Post;
      if (files?.length) {
        const media: MediaInput = await fileService.upload(files[0], {
          path: `posts/${post.id}`,
        });
        const model: PostModel = getModel(PostModel);
        await model.findByIdAndUpdate(post.id, { medias: [media] }).exec();
      }

      return (await this.getPost(user, post.id)) as PostOutput;
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new BadRquestException(err.message);
    }
  }

  async createPost(
    user: CreatorOutput,
    data: CreatePostInput,
    asDocument = false
  ): Promise<PostOutput | Post> {
    try {
      data = plainToClass(CreatePostInput, data);
      await data.validate();
      const { title, content, isPublic, medias, metadata } = data;
      const model: PostModel = getModel(PostModel);
      let post: Post & PostStaticMethods = model.create({
        title,
        content,
        isPublic,
        creator: user.id,
        medias,
        metadata,
        createdAt: new Date(),
      });
      post.processTags();
      post = await model.insert(post);
      return await this.getPost(user, post.id || post["_id"], asDocument);
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new BadRquestException(err.message);
    }
  }

  async deletePost(user: CreatorOutput, id: string): Promise<DeletePostOutput> {
    try {
      if (!user) {
        throw new Error(`Unauthorized`);
      }
      const model: PostModel = getModel(PostModel);
      const post: Post = await model
        .findOneAndDelete({
          id,
          creator: user.id,
        })
        .exec();
      if (!post) {
        throw new NotFoundException(`Post(${id}) not found.`);
      }
      return new DeletePostOutput({ success: true });
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new BadRquestException(err.message);
    }
  }
}