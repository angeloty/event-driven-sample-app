import { MediaInput } from "../../posts/dtos/post.dto";
import { IFile } from "../../shared/dtos/request.dto";
import { BaseProviderConfig } from "./config/base-provider.config";

export abstract class BaseFileProvider<C> {
  abstract prepare(config?: BaseProviderConfig<C>): Promise<any>;
  abstract upload(
    file: IFile,
    config?: Partial<BaseProviderConfig<C>>
  ): Promise<MediaInput>;
  abstract remove(
    file: Partial<MediaInput>,
    config?: Partial<BaseProviderConfig<C>>
  ): Promise<void>;
}