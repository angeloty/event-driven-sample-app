import * as mongoose from "mongoose";
import { BaseModel } from "@ten-kc/core";
import { getModel } from "@ten-kc/database";
export interface UserCredentials {
  provider: string;
  sub: string;
  secret: string;
}
export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar: string;
}
export interface User {
  id: string;
  username: string;
  email: string;
  credentials: UserCredentials[];
  profile: UserProfile;
}
export interface UserVirtuals {}
export interface UserStaticMethods {
  findByCredentials: (provider: string, sub: string) => Promise<User>;
}

const UserCredentialsSchema: mongoose.Schema<UserCredentials> =
  new mongoose.Schema<UserCredentials>({
    provider: String,
    sub: String,
    secret: String,
  });

const UserProfileSchema: mongoose.Schema<UserProfile> =
  new mongoose.Schema<UserProfile>({
    firstName: String,
    lastName: String,
    avatar: String,
  });

const UserSchema: mongoose.Schema<User> = new mongoose.Schema<User>({
  username: String,
  email: String,
  credentials: { type: [UserCredentialsSchema] },
  profile: { type: UserProfileSchema },
});
UserSchema.statics.findByCredentials = function (
  provider: string,
  sub: string
): Promise<User> {
  return new Promise<User>((resolve, reject) => {
    getModel<UserModel>(UserModel)
      .findOne({
        "credentials.provider": provider,
        "credentials.sub": sub,
      })
      .exec((err: mongoose.CallbackError, user: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(user);
      });
  });
};
export class UserModel extends BaseModel<
  User,
  UserStaticMethods,
  UserVirtuals
> {
  constructor() {
    super("users", UserSchema);
  }
}