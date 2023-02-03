import * as uuid from "uuid";
import { PubSub } from "@ten-kc/cache";
import { Application } from "@ten-kc/core";
import { TestSuite } from "apps/posts/src/testing/suite";
import { CreatorOutput } from "../../shared/dtos/creator.dto";
import {
  CreatePostInput,
  GetPostListInput,
  PostListOutput,
  PostOutput,
} from "../dtos/post.dto";
import { PostService } from "./post.service";

const platform: Application = TestSuite.init();
const requestId = "test-10kc";
jest.mock("uuid");
uuid.v4 = jest.fn(() => requestId);

const user: CreatorOutput = new CreatorOutput({
  id: requestId,
  username: "creator",
  email: "creator@test.com",
  profile: {
    firstName: "Test",
    lastName: "Creator",
    avatar: "creator.png",
  },
});
const postInput: CreatePostInput = new CreatePostInput({
  title: "Test",
  content: "Test Content",
  medias: [
    {
      url: "media.png",
      id: "media",
      title: "media.png",
    },
  ],
  metadata: [
    {
      attribute: "Collaborator",
      value: "collaborator@test.com",
    },
  ],
  isPublic: true,
});
const postFilter: GetPostListInput = new GetPostListInput({
  skip: 0,
  limit: 10,
  filter: {
    text: "Test",
  },
});
const postFilterEmpty: GetPostListInput = new GetPostListInput({
  skip: 0,
  limit: 10,
  filter: {
    text: "Testing Empty",
  },
});

let service: PostService;
let post: PostOutput;
const emitEvent = <T>(event: string, data: T, time: number = 100) => {
  setTimeout(async () => {
    const pubSub = new PubSub();
    await pubSub.init();
    if (pubSub) {
      pubSub.publish<T>(event, {
        requestId: uuid.v4(),
        data,
      });
      pubSub.close();
    }
  }, time);
};

describe("Manage Post", () => {
  beforeEach(async () => {
    await platform.ready();
    service = new PostService();
    emitEvent<CreatorOutput>(`10kc:user:get:${requestId}:data`, user);
    post = (await service.createPost(user, postInput)) as PostOutput;
  });
  it("can be created correctly", async () => {
    expect(post.id).toBeTruthy();
  });
  it("can get paginated list", async () => {
    emitEvent<CreatorOutput[]>(`10kc:user:list:${requestId}:data`, [user]);
    const output: PostListOutput = await service.getPosts(user, postFilter);
    expect(output.total).toBe(1);
    expect(output.data.length).toBe(1);
  });
  it("can get paginated empty list", async () => {
    const output: PostListOutput = await service.getPosts(
      user,
      postFilterEmpty
    );
    expect(output.total).toBe(0);
    expect(output.data.length).toBe(0);
  });
  it("paginated list => item match", async () => {
    emitEvent<CreatorOutput[]>(`10kc:user:list:${requestId}:data`, [user]);
    const output: PostListOutput = await service.getPosts(user, postFilter);
    expect(output.data[0].id).toBe(post.id);
  });
  it("get post by id", async () => {
    emitEvent<CreatorOutput>(`10kc:user:get:${requestId}:data`, user);
    const item = await service.createPost(user, postInput, true);
    const output: PostOutput = (await service.getPost(
      user,
      item.id
    )) as PostOutput;
    expect(output.id).toBe(item.id);
  });
});