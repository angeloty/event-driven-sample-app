import { Logger } from "@ten-kc/core";
import { Response } from "express";
import { Form } from "multiparty";
import { FileUploadRequest } from "../dtos/request.dto";
export const MultipartFormDataParser =
  (key = "file") =>
  async (req: FileUploadRequest, res: Response, next: () => void) => {
    if (req.method === "POST") {
      const form = new Form();
      form.parse(
        req,
        (err: Error, fields: { [key: string]: any }, files: any[]) => {
          if (err) {
            Logger.error(`Post:File:Middleware`, err.message);
            next();
            return;
          }
          let formData = {};
          Object.keys(fields).forEach((key) => {
            const value: any = fields[key]?.length
              ? fields[key][0]
              : fields[key];
            formData = { ...formData, [key]: value };
          });
          req.fileList = files[key];
          req.body = formData;
          next();
        }
      );
    } else {
      next();
    }
  };