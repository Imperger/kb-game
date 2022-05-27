import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtGuard } from '../jwt/decorators/jwt.guard';
import { User } from '../auth/decorators/user';
import { CurrentUserPipe } from './pipes/current-user.pipe';
import { CurrentUser } from './interfaces/current-user';

@Controller('user')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  me(@User(CurrentUserPipe) user: CurrentUser) {
    return user;
  }
}
