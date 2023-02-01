import { Request } from "express";

export const getBearerToken = (req: Request): string => {
  let token: string =
    req.headers.authorization || req.header("authorization") || "";
  ["Bearer", "bearer"].forEach((prefix) => {
    token = token.startsWith(prefix) ? token.replace(`${prefix} `, "") : token;
  });
  return token;
};