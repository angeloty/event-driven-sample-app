import * as mongoose from "mongoose";
import { BaseModel } from "@ten-kc/core";
import { Tag, TagSchema } from "./tag.model";
import { title } from "process";
import { processTags } from "../helpers/tag.helper";
export interface PostMetadata {
  attribute: string;
  value: string;
}
export interface PostMedia {
  id: string;
  title: string;
  description: string;
  url: string;
}
export interface Post {
  id: string;
  title: string;
  content: string;
  tags: Tag[];
  metadata: PostMetadata[];
  medias: PostMedia[];
  createdAt: Date;
  creator: string;
  isPublic: boolean;
}
export interface PostVirtuals {}
export interface PostStaticMethods {
  processTags: () => string;
}

const PostMetadataSchema: mongoose.Schema<PostMetadata> =
  new mongoose.Schema<PostMetadata>({
    attribute: String,
    value: String,
  });

const PostMediaSchema: mongoose.Schema<PostMedia> =
  new mongoose.Schema<PostMedia>({
    id: String,
    title: String,
    description: String,
    url: String,
  });

const PostSchema: mongoose.Schema<Post> = new mongoose.Schema<Post>({
  title: String,
  content: String,
  tags: { type: [TagSchema] },
  medias: { type: [PostMediaSchema] },
  metadata: { type: [PostMetadataSchema] },
  createdAt: { type: Date },
  creator: String,
  isPublic: Boolean,
});
PostSchema.methods.processTags = function () {
  let tags: Tag[] = [
    ...processTags(this.title, "user"),
    ...processTags(this.content, "user"),
    ...processTags(this.title),
    ...processTags(this.content),
  ];
  this.tags = [...(this.tags || []), ...tags].filter(
    (item, index, arr) => arr.indexOf(item) === index
  );
  return this.tags;
};
export class PostModel extends BaseModel<
  Post,
  PostStaticMethods,
  PostVirtuals
> {
  constructor() {
    super("posts", PostSchema);
  }
}