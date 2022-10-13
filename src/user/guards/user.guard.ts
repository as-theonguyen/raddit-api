import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class UserGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const id = request.params.id;

    return id === request.user.id;
  }
}
