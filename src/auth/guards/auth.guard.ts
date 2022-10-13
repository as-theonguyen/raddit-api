import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const { authorization } = request.headers;

    if (!authorization) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findByToken(authorization);

    if (!user) {
      throw new ForbiddenException();
    }

    request.user = user;

    return true;
  }
}
