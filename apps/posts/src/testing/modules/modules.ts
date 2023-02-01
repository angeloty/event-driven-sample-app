import { ModuleConstructor } from "@ten-kc/core";
import { DatabaseModule } from "@ten-kc/database";
import { CacheModule } from "@ten-kc/cache";
import { PostModule } from "../../modules/posts/post.module";
import { CommentModel } from "../../modules/shared/models/comment.model";
import { PostModel } from "../../modules/shared/models/post.model";
import { CommentsModule } from "../../modules/comments/comments.module";
import { FilesModule } from "../../modules/files/file.module";

export const Modules: ModuleConstructor[] = [
  DatabaseModule.register({
    uri: process.env.MONGODB_URI,
    host: process.env.MONGODB_HOST,
    port: process.env.MONGODB_PORT,
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
    dbName: process.env.MONGODB_DBNAME,
    models: [PostModel, CommentModel],
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
  PostModule,
  CommentsModule,
  FilesModule,
];