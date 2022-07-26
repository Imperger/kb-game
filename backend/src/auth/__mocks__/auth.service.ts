/* eslint-disable @typescript-eslint/no-unused-vars */
import { userStub } from '@/user/test/stubs/user.stub';
import {
  EmailIsTakenException,
  RegistrationAlreadyConfirmedException,
  UnknownUserForConfirmRegistrationException,
  UsernameIsTakenException
} from '../auth-exception';

export class AuthService {
  async registerUser(
    username: string,
    email: string,
    password: string
  ): Promise<string> {
    if (username === userStub().username) throw new UsernameIsTakenException();

    if (email === userStub().email) throw new EmailIsTakenException();

    return userStub().id;
  }

  async confirmRegistration(userId: string): Promise<void> {
    const user = userStub();
    const notConfirmed = userStub(false);

    if (userId === notConfirmed.id) return;
    else if (userId === user.id) {
      throw new RegistrationAlreadyConfirmedException();
    } else {
      throw new UnknownUserForConfirmRegistrationException();
    }
  }

  async generateAccessToken(userId: string): Promise<string> {
    return Promise.resolve(`access_token_${userId}`);
  }
}
