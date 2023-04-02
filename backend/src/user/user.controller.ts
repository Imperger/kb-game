import { Controller, Get, UseGuards } from '@nestjs/common';

import { CurrentUser } from './interfaces/current-user';
import { CurrentUserPipe } from './pipes/current-user.pipe';

import { User } from '@/auth/decorators/user';
import { JwtGuard } from '@/jwt/decorators/jwt.guard';

@Controller('user')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  me(@User(CurrentUserPipe) user: CurrentUser) {
    return user;
  }
}
