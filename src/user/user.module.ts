import { forwardRef, Module } from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import { UserController } from '@src/user/user.controller';
import { FollowModule } from '@src/follow/follow.module';

@Module({
  imports: [forwardRef(() => FollowModule)],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
