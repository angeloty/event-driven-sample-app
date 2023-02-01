import { Response } from "express";
import { getBearerToken } from "../../../../../../libs/core/src/helpers/auth.helper";
import { AuthService } from "../../auth/services/auth.service";
import { AuthRequest } from "../dtos/request.dto";
import { User } from "../models/user.model";

export const AuthenticationMiddleware = async (
  req: AuthRequest,
  resp: Response,
  next: Function
) => {
  try {
    const service: AuthService = new AuthService();
    const token = getBearerToken(req);
    const user = (await service.getUserByToken(token)) as User;
    req.user = user;
    next();
  } catch (err) {
    resp.status(401).send();
    return;
  }
};