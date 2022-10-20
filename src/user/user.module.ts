import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import { UserController } from '@src/user/user.controller';
import { FollowModule } from '@src/follow/follow.module';
import { CurrentUserMiddleware } from '@src/user/middlewares/current-user.middleware';

@Module({
  imports: [forwardRef(() => FollowModule)],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .forRoutes({ path: 'users/me', method: RequestMethod.GET });
  }
}
