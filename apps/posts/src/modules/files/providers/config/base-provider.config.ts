export interface BaseProviderConfig<T> {
  uploaderConfig: T;
  path?: string;
  basePath: string;
}