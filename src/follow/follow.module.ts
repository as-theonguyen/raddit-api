import { forwardRef, Module } from '@nestjs/common';
import { FollowService } from '@src/follow/follow.service';
import { FollowController } from '@src/follow/follow.controller';
import { UserModule } from '@src/user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [FollowService],
  controllers: [FollowController],
  exports: [FollowService],
})
export class FollowModule {}
