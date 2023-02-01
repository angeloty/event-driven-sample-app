import { getModel } from "../../../../../../libs/database/src/helpers/database.helper";
import { User, UserModel } from "../../shared/models/user.model";
import {
  GetUsersInput,
  UserListOutput,
  UserOutput,
} from "../../shared/dtos/user.dto";
import { plainToClass, plainToInstance } from "class-transformer";
import { CreateUserInput } from "../dtos/user.dto";
import { AuthService } from "../../auth/services/auth.service";

export class UserService {
  constructor() {}
  async getUsers(user: User, params: GetUsersInput): Promise<UserListOutput> {
    try {
      if (!user) {
        throw new Error(`Unauthorized`);
      }
      params = plainToClass(GetUsersInput, params);
      await params.validate();
      const { skip, limit } = params;
      let { filter, sort } = params;
      filter = filter || {};
      sort = sort || { username: -1 };
      const model: UserModel = getModel(UserModel);
      const result: User[] = await model
        .find(filter)
        .skip(skip || 0)
        .limit(limit || 50)
        .sort(sort)
        .exec();
      const total: number = await model.count(filter).exec();
      const data: UserOutput[] = result.map((user: User) =>
        model.toResponse<UserOutput>(UserOutput, user)
      );
      return plainToInstance(UserListOutput, {
        total,
        data,
        params,
      });
    } catch (err) {
      throw err;
    }
  }
  async getUser(user: User, id: string): Promise<UserOutput> {
    try {
      if (!user) {
        throw new Error(`Unauthorized`);
      }
      id = id === "me" ? user.id : id;
      return await this.getUserById(id);
    } catch (err) {
      throw err;
    }
  }
  async getUserById(id: string): Promise<UserOutput> {
    try {
      const model: UserModel = getModel(UserModel);
      const user: User = await model.findById(id).exec();
      return model.toResponse<UserOutput>(UserOutput, user);
    } catch (err) {
      throw err;
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
      throw err;
    }
  }

  async createUser(data: CreateUserInput): Promise<UserOutput> {
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
      const resp: UserOutput = model.toResponse<UserOutput>(UserOutput, user);
      return resp;
    } catch (err) {
      throw err;
    }
  }
}