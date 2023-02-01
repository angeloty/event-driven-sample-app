import { Response } from "express";
import {
  BaseRestController,
  Controller,
  Delete,
  Get,
  Post,
} from "@ten-kc/core";
import { PostService } from "../services/post.service";
import { DeletePostOutput, PostOutput } from "../dtos/post.dto";
import { AuthenticationMiddleware } from "../../shared/middleware/auth.middleware";
import { AuthRequest, FileUploadRequest } from "../../shared/dtos/request.dto";
import { MultipartFormDataParser } from "../../shared/middleware/form-data.middleware";

@Controller("posts")
export class PostController extends BaseRestController {
  private service: PostService;
  constructor() {
    super();
    this.service = new PostService();
  }
  @Get("", { middleware: [AuthenticationMiddleware] })
  async getPosts(req: AuthRequest, resp: Response): Promise<void> {
    try {
      const response = await this.service.getPosts(req.user, req.query as any);
      resp.status(200).send(response);
      return;
    } catch (err) {
      resp.status(500).send(err.message);
      return;
    }
  }
  @Get(":id", { middleware: [AuthenticationMiddleware] })
  async getPost(req: AuthRequest, resp: Response): Promise<void> {
    try {
      const id: string = req.params.id;
      const response: PostOutput = (await this.service.getPost(
        req.user,
        id
      )) as PostOutput;
      resp.status(200).send(response);
      return;
    } catch (err) {
      resp.status(500).send(err.message);
      return;
    }
  }
  @Post("form", {
    middleware: [AuthenticationMiddleware, MultipartFormDataParser("file")],
  })
  async createPostWithFile(
    req: FileUploadRequest,
    resp: Response
  ): Promise<void> {
    try {
      const response: PostOutput = await this.service.createPostWithFile(
        req.user,
        req.body,
        req.fileList
      );
      resp.status(201).send(response);
      return;
    } catch (err) {
      resp.status(400).send(err.message);
      return;
    }
  }
  @Post("", { middleware: [AuthenticationMiddleware] })
  async createPost(req: AuthRequest, resp: Response): Promise<void> {
    try {
      const response: PostOutput = (await this.service.createPost(
        req.user,
        req.body
      )) as PostOutput;
      resp.status(201).send(response);
      return;
    } catch (err) {
      resp.status(400).send(err.message);
      return;
    }
  }
  @Delete(":id", { middleware: [AuthenticationMiddleware] })
  async deletePost(req: AuthRequest, resp: Response): Promise<void> {
    try {
      const id: string = req.params.id;
      const response: DeletePostOutput = await this.service.deletePost(
        req.user,
        id
      );
      resp.status(200).send(response);
      return;
    } catch (err) {
      resp.status(500).send(err.message);
      return;
    }
  }
}