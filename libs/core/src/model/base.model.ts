import { plainToClassFromExist, plainToInstance } from "class-transformer";
import * as mongoose from "mongoose";

export class BaseModel<T, TMethods, TVirtuals> {
  protected _model: mongoose.Model<T, {}, TMethods, TVirtuals>;
  constructor(protected _name: string, protected _schema: mongoose.Schema<T>) {}
  register(conn: mongoose.Connection): mongoose.Model<T> {
    this.model = conn.model<T>(this._name, this._schema) as mongoose.Model<
      T,
      {},
      TMethods,
      TVirtuals
    >;
    return this.model;
  }

  get name(): string {
    return this._name;
  }

  get model(): mongoose.Model<T, {}, TMethods, TVirtuals> {
    return this._model;
  }

  set model(model: mongoose.Model<T, {}, TMethods, TVirtuals>) {
    this._model = model;
  }

  create(data: Partial<T>): mongoose.HydratedDocument<T, TMethods, TMethods> {
    return new this.model(data) as mongoose.HydratedDocument<
      T,
      TMethods,
      TMethods
    >;
  }
  insertMany<DocContents = mongoose.AnyKeys<T>>(
    docs: Array<T | DocContents>,
    options?: mongoose.SaveOptions,
    callback?: mongoose.Callback<
      Array<mongoose.HydratedDocument<T, TMethods, TVirtuals>>
    >
  ): Promise<mongoose.HydratedDocument<T, TMethods, TVirtuals>[]> {
    return this.model.create(docs, options, callback);
  }
  insert<DocContents = mongoose.AnyKeys<T>>(
    docs: T | DocContents
  ): Promise<mongoose.HydratedDocument<T, TMethods, TVirtuals>> {
    return this.model.create(docs);
  }
  find<ResultDoc = mongoose.HydratedDocument<T, TMethods, TVirtuals>>(
    filter: mongoose.FilterQuery<T>,
    projection?: mongoose.ProjectionType<T> | null | undefined,
    options?: mongoose.QueryOptions<T> | null | undefined,
    callback?: mongoose.Callback<ResultDoc[]> | undefined
  ) {
    return this.model.find(filter, projection, options, callback);
  }
  aggregate(
    pipeline?: mongoose.PipelineStage[],
    options?: mongoose.AggregateOptions,
    callback?: mongoose.Callback<any[]>
  ) {
    return this.model.aggregate(pipeline, options, callback);
  }
  findById(
    id: any,
    projection?: mongoose.ProjectionType<T> | null | undefined
  ) {
    return this.model.findById(id, projection);
  }
  findByIdAndUpdate(
    id: any,
    update: mongoose.UpdateQuery<T>,
    options?: mongoose.QueryOptions<T> & { rawResult: true }
  ) {
    return this.model.findByIdAndUpdate(id, update, options);
  }
  findByIdAndRemove(
    id: any,
    options?: mongoose.QueryOptions<T> | null | undefined
  ) {
    return this.model.findByIdAndDelete(id, options);
  }

  findByIdAndDelete(
    id: any,
    options?: mongoose.QueryOptions<T> | null | undefined
  ) {
    return this.model.findByIdAndDelete(id, options);
  }

  findOne(
    filter: mongoose.FilterQuery<T>,
    projection?: mongoose.ProjectionType<T> | null | undefined
  ) {
    return this.model.findOne(filter, projection);
  }
  findOneAndUpdate(
    filter: mongoose.FilterQuery<T>,
    update: mongoose.UpdateQuery<T>,
    options: mongoose.QueryOptions<T> & { rawResult: true }
  ) {
    return this.model.findOneAndUpdate(filter, update, options);
  }
  findOneAndDelete(
    filter: mongoose.FilterQuery<T>,
    options?: mongoose.QueryOptions<T> | null | undefined
  ) {
    return this.model.findOneAndDelete(filter, options);
  }
  findOneAndRemove(
    filter: mongoose.FilterQuery<T>,
    options?: mongoose.QueryOptions<T> | null | undefined
  ) {
    return this.model.findOneAndRemove(filter, options);
  }
  findOneAndReplace(
    filter: mongoose.FilterQuery<T>,
    replacement: T | mongoose.AnyObject,
    options: mongoose.QueryOptions<T> & { rawResult: true }
  ) {
    return this.model.findOneAndReplace(filter, replacement, options);
  }
  countDocuments(
    filter: mongoose.FilterQuery<T>,
    options?: mongoose.QueryOptions<T>
  ) {
    return this.model.countDocuments(filter, options);
  }
  count(filter: mongoose.FilterQuery<T>) {
    return this.model.count(filter);
  }
  updateOne(
    filter?: mongoose.FilterQuery<T>,
    update?: mongoose.UpdateQuery<T> | mongoose.UpdateWithAggregationPipeline,
    options?: mongoose.QueryOptions<T> | null
  ) {
    return this.model.updateOne(filter, update, options);
  }
  updateMany(
    filter?: mongoose.FilterQuery<T>,
    update?: mongoose.UpdateQuery<T> | mongoose.UpdateWithAggregationPipeline,
    options?: mongoose.QueryOptions<T> | null
  ) {
    return this.model.updateMany(filter, update, options);
  }
  toResponse<R>(
    Resp: new (...args) => R,
    data: T | mongoose.HydratedDocument<T, TMethods, TVirtuals>,
    extra?: Partial<R> | {}
  ): R {
    let resp: R = plainToInstance(Resp, data, {
      excludeExtraneousValues: true,
    });
    if (extra) {
      resp = plainToClassFromExist(
        resp,
        { ...resp, ...extra },
        {
          excludeExtraneousValues: true,
        }
      );
    }
    return resp;
  }
}