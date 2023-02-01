import { getBearerToken } from "@ten-kc/core";
import { Response } from "express";
import { CreatorOutput } from "../dtos/creator.dto";
import { AuthRequest } from "../dtos/request.dto";
import { UserService } from "../services/user.service";

export const AuthenticationMiddleware = async (
  req: AuthRequest,
  resp: Response,
  next: Function
) => {
  try {
    const service: UserService = new UserService();
    const token = getBearerToken(req);
    const user = (await service.getUserByToken(token)) as CreatorOutput;
    req.user = user;
    next();
  } catch (err) {
    resp.status(401).send();
    return;
  }
};
export const DirectAuthenticationMiddleware = async (
  req: AuthRequest,
  resp: Response,
  next: Function
) => {
  try {
    const service: UserService = new UserService();
    const token = req.query?.token as string;
    const user = (await service.getUserByToken(token)) as CreatorOutput;
    req.user = user;
    next();
  } catch (err) {
    resp.status(401).send();
    return;
  }
};