import { Application } from "@ten-kc/core";
import { TestSuite } from "apps/users/src/testing/suite";
import { JsonWebTokenError } from "jsonwebtoken";
import { GetUsersInput, UserOutput } from "../../shared/dtos/user.dto";
import { User } from "../../shared/models/user.model";
import { CreateUserInput } from "../../users/dtos/user.dto";
import { UserService } from "../../users/services/user.service";
import { AuthOutput, GetAuthInput, GetRefreshInput } from "../dtos/auth.dto";
import { AuthService } from "./auth.service";

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
describe("User Authentication", () => {
  let userService: UserService;
  let service: AuthService;
  let user: UserOutput;
  let token: string;
  let refreshToken: string;
  beforeEach(async () => {
    await platform.ready();
    userService = new UserService();
    service = new AuthService();
    user = (await userService.createUser(userInput)) as UserOutput;
    const login: AuthOutput = await service.login({
      provider: userInput.credentials.provider,
      secret: userInput.credentials.secret,
      sub: userInput.credentials.sub,
    } as GetAuthInput);
    token = login.token;
    refreshToken = login.refreshToken;
  });
  it("can login", async () => {
    const output: AuthOutput = await service.login({
      provider: userInput.credentials.provider,
      secret: userInput.credentials.secret,
      sub: userInput.credentials.sub,
    } as GetAuthInput);
    expect(output.token).toBeTruthy();
    expect(output.refreshToken).toBeTruthy();
  });
  it("can't login", async () => {
    let err: Error;
    try {
      await service.login({
        provider: userInput.credentials.provider,
        secret: `${userInput.credentials.secret}aa`,
        sub: userInput.credentials.sub,
      } as GetAuthInput);
    } catch (e) {
      err = e;
    }
    expect(err).toBeTruthy();
    expect(err instanceof Error).toBe(true);
  });
  it("can refresh token", async () => {
    const output: AuthOutput = await service.refresh({
      refresh: refreshToken,
      token,
    } as GetRefreshInput);
    expect(output.token).toBeTruthy();
    expect(output.refreshToken).toBeTruthy();
  });
  it("can't refresh token", async () => {
    let err: Error;
    try {
      await service.refresh({
        refresh: `${refreshToken}a`,
        token,
      } as GetRefreshInput);
    } catch (e) {
      err = e;
    }
    expect(err).toBeTruthy();
    expect(err instanceof JsonWebTokenError).toBe(true);
  });
  it("get user by token", async () => {
    const output: UserOutput = (await service.getUserByToken(
      token
    )) as UserOutput;
    expect(output.id).toBe(user.id);
  });
});