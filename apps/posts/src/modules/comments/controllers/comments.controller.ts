import { Response } from "express";
import {
  BaseException,
  BaseRestController,
  Controller,
  Delete,
  Get,
  Post,
} from "@ten-kc/core";
import { CommentsService } from "../services/comments.service";
import {
  CommentListOutput,
  CommentOutput,
  DeleteCommentOutput,
} from "../dtos/comments.dto";
import { AuthenticationMiddleware } from "../../shared/middleware/auth.middleware";
import { AuthRequest } from "../../shared/dtos/request.dto";

@Controller("posts/:post/comments")
export class CommentsController extends BaseRestController {
  private service: CommentsService;
  constructor() {
    super();
    this.service = new CommentsService();
  }
  @Get("", { middleware: [AuthenticationMiddleware] })
  async getComments(req: AuthRequest, resp: Response): Promise<void> {
    try {
      const response: CommentListOutput = await this.service.getComments(
        req.user,
        {
          ...(req.query || {}),
          filter: { ...(req.params || {}) },
        } as any
      );
      resp.status(200).send(response);
      return;
    } catch (err) {
      if (err instanceof BaseException) {
        return err.send(resp);
      }
      resp.status(500).send(err.message);
      return;
    }
  }
  @Get(":id", { middleware: [AuthenticationMiddleware] })
  async getComment(req: AuthRequest, resp: Response): Promise<void> {
    try {
      const id: string = req.params.id;
      const response: CommentOutput = await this.service.getComment(
        req.user,
        id
      );
      resp.status(200).send(response);
      return;
    } catch (err) {
      if (err instanceof BaseException) {
        return err.send(resp);
      }
      resp.status(500).send(err.message);
      return;
    }
  }
  @Post("", { middleware: [AuthenticationMiddleware] })
  async createComment(req: AuthRequest, resp: Response): Promise<void> {
    try {
      const response: CommentOutput = await this.service.createComment(
        req.user,
        {
          ...(req.body || {}),
          ...(req.params || {}),
        }
      );
      resp.status(201).send(response);
      return;
    } catch (err) {
      if (err instanceof BaseException) {
        return err.send(resp);
      }
      resp.status(400).send(err.message);
      return;
    }
  }
  @Delete(":id", { middleware: [AuthenticationMiddleware] })
  async deleteComment(req: AuthRequest, resp: Response): Promise<void> {
    try {
      const id: string = req.params.id;
      const response: DeleteCommentOutput = await this.service.deleteComment(
        req.user,
        id
      );
      resp.status(200).send(response);
      return;
    } catch (err) {
      if (err instanceof BaseException) {
        return err.send(resp);
      }
      resp.status(500).send(err.message);
      return;
    }
  }
}