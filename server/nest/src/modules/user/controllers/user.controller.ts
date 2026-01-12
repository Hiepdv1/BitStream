import { Controller, Get, HttpCode } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Ok } from 'src/common/response/response.helper';
// import { SkipThrottle } from '@nestjs/throttler';
// import { Throttle } from '@nestjs/throttler';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  // @Throttle({ default: { ttl: 6000, limit: 3 } })
  // @SkipThrottle()
  @HttpCode(200)
  public GetStreaming() {
    return Ok('Welcome streming services');
  }
}
