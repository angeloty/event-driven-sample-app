import { BaseModel } from "@ten-kc/core";
import { DatabaseModule } from "../database.module";

export const registerModel = <T, TMethods, TVirtuals>(
  Model: new (...args) => BaseModel<T, TMethods, TVirtuals>,
  db?: string
): BaseModel<T, TMethods, TVirtuals> => {
  return DatabaseModule.registerModel<T, TMethods, TVirtuals>(Model, db);
};
export const getModel = <M extends BaseModel<any, any, any>>(
  model: (new (...args) => M) | string,
  db?: string
): M => {
  return DatabaseModule.getModel<M>(model, db);
};