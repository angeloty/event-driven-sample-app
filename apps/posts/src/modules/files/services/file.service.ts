import { BadRquestException, BaseDTO, BaseException } from "@ten-kc/core";
import { Request, Response } from "express";
import { join } from "path";
import { MediaInput } from "../../posts/dtos/post.dto";
import { IFile } from "../../shared/dtos/request.dto";
import { PostMedia } from "../../shared/models/post.model";
import { BaseProviderConfig } from "../providers/config/base-provider.config";
import { BaseFileProvider } from "../providers/file-base.provider";
import { LocalFileProvider } from "../providers/local/local-file.provider";

export class FileService {
  private _provider: BaseFileProvider<any>;
  constructor() {
    this.initProvider();
  }
  initProvider() {
    if (!this._provider) {
      switch (process.env.FILE_PROCESSOR || "local") {
        default:
          this._provider = new LocalFileProvider({
            basePath: join(
              process.cwd(),
              process.env.FILE_PUBLIC_FOLDER || "public",
              process.env.FILE_PATH || "uploads"
            ),
            uploaderConfig: {
              limits: {
                fileSize: 4000,
              },
            },
          });
          break;
      }
    }
    return;
  }
  get provider() {
    this.initProvider();
    return this._provider;
  }
  async upload<P extends BaseDTO>(
    file: IFile,
    config?: Partial<BaseProviderConfig<any>>
  ): Promise<MediaInput> {
    try {
      await this.provider.prepare();
      const media: MediaInput = await this.provider.upload(file, config);
      return media;
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new BadRquestException(err.message);
    }
  }
}