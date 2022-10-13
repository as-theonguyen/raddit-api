import { Module } from '@nestjs/common';
import { FollowService } from '@src/follow/follow.service';
import { FollowController } from '@src/follow/follow.controller';

@Module({
  providers: [FollowService],
  controllers: [FollowController],
})
export class FollowModule {}
