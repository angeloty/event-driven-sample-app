import * as mongoose from "mongoose";
export interface Tag {
  name: string;
  type: string;
  link: string;
}

export const TagSchema: mongoose.Schema<Tag> = new mongoose.Schema<Tag>({
  name: String,
  type: String,
  link: String,
});