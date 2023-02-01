import { Request, Response } from "express";
import { BaseRestController, Controller, Get, Post } from "@ten-kc/core";
import { AuthOutput, GetRefreshInput } from "../dtos/auth.dto";
import { AuthService } from "../services/auth.service";
import { getBearerToken } from "../../../../../../libs/core/src/helpers/auth.helper";
@Controller("auth")
export class AuthController extends BaseRestController {
  constructor() {
    super();
  }
  @Post("login")
  async login(req: Request, resp: Response): Promise<void> {
    try {
      const service = new AuthService();
      const response: AuthOutput = await service.login(req.body);
      resp.status(200).send(response);
      return;
    } catch (err) {
      resp.status(400).send(err.message);
      return;
    }
  }
  @Get("refresh")
  async refresh(req: Request, resp: Response): Promise<void> {
    try {
      const service = new AuthService();
      const response: AuthOutput = await service.refresh({
        ...(req.query || {}),
        token: getBearerToken(req),
      } as GetRefreshInput);
      resp.status(200).send(response);
      return;
    } catch (err) {
      resp.status(400).send(err.message);
      return;
    }
  }
}