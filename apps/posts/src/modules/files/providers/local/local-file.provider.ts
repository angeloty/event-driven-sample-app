import { BaseException, NotFoundException } from "@ten-kc/core";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { v4 } from "uuid";
import { MediaInput } from "../../../posts/dtos/post.dto";
import { IFile } from "../../../shared/dtos/request.dto";
import { BaseProviderConfig } from "../config/base-provider.config";
import { BaseFileProvider } from "../file-base.provider";
export interface LocalFileUploaderConfig {
  limits?: { fileSize?: number };
}
export class LocalFileProvider extends BaseFileProvider<LocalFileUploaderConfig> {
  constructor(private config: BaseProviderConfig<LocalFileUploaderConfig>) {
    super();
  }
  prepare(): Promise<void> {
    return;
  }
  upload(
    { path, originalFilename }: IFile,
    config: Partial<BaseProviderConfig<LocalFileUploaderConfig>>
  ): Promise<MediaInput> {
    const id = v4();
    let url = join(`${config?.path || this.config?.path || `file-${id}`}`);
    const basePath = join(
      config.basePath ||
        this.config.basePath ||
        join(process.cwd(), "public/uploads"),
      url
    );
    const destination = join(basePath, originalFilename);
    if (!existsSync(path)) {
      throw new Error(`File(${originalFilename}) not found as ${path}`);
    }
    if (!existsSync(basePath)) {
      mkdirSync(basePath, { recursive: true });
    }
    const file = readFileSync(path);
    writeFileSync(destination, file);
    unlinkSync(path);
    return Promise.resolve({
      title: originalFilename,
      url: join(
        `${process.env.FILE_PUBLIC_FOLDER || "public"}`,
        url,
        originalFilename
      ),
      description: "",
      id,
    } as MediaInput);
  }
  remove(
    { title, url }: MediaInput,
    config: Partial<BaseProviderConfig<LocalFileUploaderConfig>>
  ): Promise<void> {
    try {
      const path = join(
        config.basePath ||
          this.config.basePath ||
          join(process.cwd(), "public/uploads"),
        url.replace("public", "")
      );
      if (!existsSync(path)) {
        throw new NotFoundException(
          `File "${title}" not found on location "${path}"`
        );
      }
      unlinkSync(path);
      return;
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new NotFoundException(err.message);
    }
  }
}