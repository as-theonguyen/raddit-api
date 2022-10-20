import { NextFunction, Request, Response } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { UserService } from '@src/user/user.service';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) {
      req.user = null;
      return next();
    }

    const user = await this.userService.findByToken(authorization);

    req.user = user;

    return next();
  }
}
