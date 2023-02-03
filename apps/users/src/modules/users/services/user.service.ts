import { getModel } from "../../../../../../libs/database/src/helpers/database.helper";
import { User, UserModel } from "../../shared/models/user.model";
import {
  GetUsersInput,
  UserFilterInput,
  UserListOutput,
  UserOutput,
} from "../../shared/dtos/user.dto";
import { plainToClass, plainToInstance } from "class-transformer";
import { CreateUserInput } from "../dtos/user.dto";
import { AuthService } from "../../auth/services/auth.service";
import { QueryOptions } from "mongoose";
import {
  BadRquestException,
  BaseException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "@ten-kc/core";

export class UserService {
  constructor() {}
  async getUsers(user: User, params: GetUsersInput): Promise<UserListOutput> {
    try {
      if (!user) {
        throw new UnauthorizedException(`Unauthorized`);
      }
      params = plainToClass(GetUsersInput, params);
      await params.validate();
      const { skip, limit, filter } = params;
      let { sort } = params;
      const { name, email } = filter || ({} as UserFilterInput);
      let query: QueryOptions<User> = {};
      if (name) {
        query = {
          ...query,
          $or: [
            {
              username: { $regex: new RegExp(name, "i") },
            },
            {
              "profile.firstName": { $regex: new RegExp(name, "i") },
            },
            {
              "profile.lastName": { $regex: new RegExp(name, "i") },
            },
          ],
        };
      }
      if (email) {
        query = {
          ...query,
          email,
        };
      }
      sort = sort || { username: -1 };
      const model: UserModel = getModel(UserModel);
      const result: User[] = await model
        .find(query)
        .skip(skip || 0)
        .limit(limit || 50)
        .sort(sort)
        .exec();
      const total: number = await model.count(query).exec();
      const data: UserOutput[] = result.map((user: User) =>
        model.toResponse<UserOutput>(UserOutput, user)
      );
      return plainToInstance(UserListOutput, {
        total,
        data,
        params,
      });
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new ConflictException(err.message);
    }
  }
  async getUser(user: User, id: string): Promise<UserOutput> {
    try {
      if (!user) {
        throw new UnauthorizedException(`Unauthorized`);
      }
      id = id === "me" ? user.id : id;
      return await this.getUserById(id);
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new NotFoundException(err.message);
    }
  }
  async getUserById(id: string): Promise<UserOutput> {
    try {
      const model: UserModel = getModel(UserModel);
      const user: User = await model.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User(${id}) not found`);
      }
      return model.toResponse<UserOutput>(UserOutput, user);
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new NotFoundException(`User(${id}) not found[${err.message}]`);
    }
  }
  async getUserByIds(ids: string[]): Promise<UserOutput[]> {
    try {
      const model: UserModel = getModel(UserModel);
      const users: User[] = await model
        .find({
          id: {
            $in: ids,
          },
        })
        .exec();
      return users.map((user: User) =>
        model.toResponse<UserOutput>(UserOutput, user)
      );
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new ConflictException(err.message);
    }
  }

  async createUser(
    data: CreateUserInput,
    asDocument = false
  ): Promise<UserOutput | User> {
    try {
      data = plainToClass(CreateUserInput, data);
      await data.validate();
      const { email, username, profile, credentials } = data;
      const auth = new AuthService(credentials.provider);
      const model: UserModel = getModel(UserModel);
      let user: User = model.create({
        email,
        username,
        profile,
      });
      user.credentials = [await auth.provider.credentials(credentials)];
      user = await model.insert(user);
      if (asDocument) {
        return user;
      }
      const resp: UserOutput = model.toResponse<UserOutput>(UserOutput, user);
      return resp;
    } catch (err) {
      if (err instanceof BaseException) {
        throw err;
      }
      throw new BadRquestException(err.message);
    }
  }
}