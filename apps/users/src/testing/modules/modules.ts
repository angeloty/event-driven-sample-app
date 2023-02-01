import { ModuleConstructor } from "@ten-kc/core";
import { DatabaseModule } from "@ten-kc/database";
import { CacheModule } from "@ten-kc/cache";
import { AuthModule } from "../../modules/auth/auth.module";
import { UserModel } from "../../modules/shared/models/user.model";
import { UserModule } from "../../modules/users/user.module";

export const Modules: ModuleConstructor[] = [
  DatabaseModule.register({
    uri: process.env.MONGODB_URI,
    host: process.env.MONGODB_HOST,
    port: process.env.MONGODB_PORT,
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
    dbName: process.env.MONGODB_DBNAME,
    models: [UserModel],
    testing: true,
  }),
  CacheModule.register({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    user: process.env.REDIS_USER,
    password: process.env.REDIS_PASS,
    db: Number(process.env.REDIS_DB || 0),
    testing: true,
  }),
  UserModule,
  AuthModule,
];