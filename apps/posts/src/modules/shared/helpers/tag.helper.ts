import { Tag } from "../models/tag.model";

export const processTags = (
  text: string,
  type: "user" | "hashtag" = "hashtag"
): Tag[] => {
  let tags: Tag[] = [];
  const prefix = type === "user" ? "@" : "#";
  const title = text.startsWith(prefix) ? ` ${text} ` : `${text} `;
  const userTags = title.split(prefix);
  userTags.forEach((val, i) => {
    const index = i + 1;
    if (index > 0 && index % 2 === 0) {
      const [tag] = val.split(" ");
      tags = [...tags, { name: tag, type, link: `${type}:${tag}` }];
    }
  });
  return tags;
};