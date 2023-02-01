import { Request, Response } from "express";
import { BaseRestController, Controller, Get, Post } from "@ten-kc/core";
import {
  GetUsersInput,
  UserListOutput,
  UserOutput,
} from "../../shared/dtos/user.dto";
import { UserService } from "../services/user.service";
import { CreateUserInput } from "../dtos/user.dto";
import { AuthenticationMiddleware } from "../../shared/middleware/auth.middleware";
import { AuthRequest } from "../../shared/dtos/request.dto";

@Controller("users")
export class UserController extends BaseRestController {
  private service: UserService;
  constructor() {
    super();
    this.service = new UserService();
  }
  @Get("", { middleware: [AuthenticationMiddleware] })
  async getUsers(req: AuthRequest, resp: Response): Promise<void> {
    try {
      const response: UserListOutput = await this.service.getUsers(
        req.user,
        req.query as any
      );
      resp.status(200).send(response);
      return;
    } catch (err) {
      resp.status(500).send(err.message);
      return;
    }
  }
  @Get(":id", { middleware: [AuthenticationMiddleware] })
  async getUser(req: AuthRequest, resp: Response): Promise<void> {
    try {
      const id: string = req.params.id;
      const response: UserOutput = await this.service.getUser(req.user, id);
      resp.status(200).send(response);
      return;
    } catch (err) {
      resp.status(500).send(err.message);
      return;
    }
  }
  @Post("")
  async createUser(req: Request, resp: Response): Promise<void> {
    try {
      const response: UserOutput = await this.service.createUser(req.body);
      resp.status(201).send(response);
      return;
    } catch (err) {
      resp.status(400).send(err.message);
      return;
    }
  }
}