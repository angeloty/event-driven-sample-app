import { User, UserCredentials } from "../../shared/models/user.model";

export abstract class AuthBaseProvider {
  abstract credentials(
    credentials: Partial<UserCredentials>
  ): Promise<UserCredentials>;
  abstract prepare(user: User): Promise<any>;
  abstract validate(user: User, credentials: UserCredentials): Promise<boolean>;
}