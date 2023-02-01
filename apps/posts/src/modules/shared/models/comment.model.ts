import * as mongoose from "mongoose";
import { BaseModel } from "@ten-kc/core";
import { Tag, TagSchema } from "./tag.model";
import { Post } from "./post.model";
import { processTags } from "../helpers/tag.helper";

export interface Comment {
  id: string;
  title: string;
  content: string;
  tags: Tag[];
  post: Post;
  createdAt: Date;
  creator: string;
}
export interface CommentVirtuals {}
export interface CommentStaticMethods {
  processTags: () => string;
}

const CommentSchema: mongoose.Schema<Comment> = new mongoose.Schema<Comment>({
  title: String,
  content: String,
  tags: { type: [TagSchema] },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "posts" },
  createdAt: { type: Date },
  creator: String,
});

CommentSchema.methods.processTags = function () {
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
export class CommentModel extends BaseModel<
  Comment,
  CommentStaticMethods,
  CommentVirtuals
> {
  constructor() {
    super("comments", CommentSchema);
  }
}