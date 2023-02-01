import { compareSync, hashSync } from "bcrypt";
import { UserCredentials, User } from "../../../shared/models/user.model";
import { AuthBaseProvider } from "../auth-base.provider";

export class AuthLocalProvider extends AuthBaseProvider {
  async credentials(
    credentials: Partial<UserCredentials>
  ): Promise<UserCredentials> {
    try {
      credentials.secret = hashSync(
        credentials.secret,
        Number(process.env.AUTH_PASSWORD_SALT || 10)
      );
      credentials.provider = "local";
      return credentials as UserCredentials;
    } catch (err) {
      throw err;
    }
  }
  prepare(user: User): Promise<any> {
    throw new Error("Method not implemented.");
  }
  async validate(
    user: User,
    { provider, secret, sub }: UserCredentials
  ): Promise<boolean> {
    const credentials: UserCredentials = user.credentials.find(
      (credential) => credential.sub === sub && credential.provider === provider
    );
    if (!credentials) {
      throw new Error(
        `Invalid credential config for User(${sub}) with provider "${provider}"`
      );
    }
    if (compareSync(secret, credentials.secret)) {
      return true;
    }
    throw new Error(
      `Invalid credentials for User(${sub}) with provider "${provider}"`
    );
  }
}