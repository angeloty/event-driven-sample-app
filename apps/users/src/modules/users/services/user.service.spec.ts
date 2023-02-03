import { Application } from "@ten-kc/core";
import { TestSuite } from "apps/users/src/testing/suite";
import {
  GetUsersInput,
  UserListOutput,
  UserOutput,
} from "../../shared/dtos/user.dto";
import { User } from "../../shared/models/user.model";
import { CreateUserInput } from "../dtos/user.dto";
import { UserService } from "./user.service";

const platform: Application = TestSuite.init();

const userInput: CreateUserInput = new CreateUserInput({
  username: "user@test.com",
  email: "user@test.com",
  credentials: {
    sub: "user@test.com",
    secret: "Test@123",
    provider: "local",
  },
  profile: {
    firstName: "Test",
    lastName: "User",
    avatar: "test-avatar",
  },
});
const userFilter: GetUsersInput = new GetUsersInput({
  skip: 0,
  limit: 10,
  filter: {
    name: "Test",
  },
});
const userFilterEmpty: GetUsersInput = new GetUsersInput({
  skip: 0,
  limit: 10,
  filter: {
    name: "Tested",
  },
});
describe("User Management ", () => {
  let service: UserService;
  beforeEach(async () => {
    await platform.ready();
    service = new UserService();
  });
  it("can be created correctly", async () => {
    const output: UserOutput = (await service.createUser(
      userInput
    )) as UserOutput;
    expect(output.id).toBeTruthy();
  });
  it("can get paginated list", async () => {
    const user: User = (await service.createUser(userInput, true)) as User;
    const userList: UserListOutput = await service.getUsers(user, userFilter);
    expect(userList.total).toBe(1);
    expect(userList.data.length).toBe(1);
    expect(userList.data[0].id).toBe(user.id);
  });
  it("can get paginated empty list", async () => {
    const user: User = (await service.createUser(userInput, true)) as User;
    const userList: UserListOutput = await service.getUsers(
      user,
      userFilterEmpty
    );
    expect(userList.total).toBe(0);
  });
  it("can get one by id", async () => {
    const user: User = (await service.createUser(userInput, true)) as User;
    const output: UserOutput = await service.getUser(user, user.id);
    expect(output.id).toBe(user.id);
    expect(output.username).toBe(user.username);
    expect(output.email).toBe(user.email);
  });
  it("can get one by id(no auth)", async () => {
    const user: User = (await service.createUser(userInput, true)) as User;
    const output: UserOutput = await service.getUserById(user.id);
    expect(output.id).toBe(user.id);
    expect(output.username).toBe(user.username);
    expect(output.email).toBe(user.email);
  });
});