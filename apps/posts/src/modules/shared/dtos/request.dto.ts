import { Request } from "express";
import { CreatorOutput } from "./creator.dto";

export interface AuthRequest extends Request {
  user: CreatorOutput;
}
export interface IFile {
  fieldName: string;
  headers: { [key: string]: string };
  originalFilename: string;
  path: string;
  size: number;
}
export interface FileUploadRequest extends AuthRequest {
  fileList?: IFile[];
}