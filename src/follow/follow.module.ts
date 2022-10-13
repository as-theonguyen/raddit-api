import { Module } from '@nestjs/common';
import { FollowService } from '@src/follow/follow.service';

@Module({
  providers: [FollowService],
})
export class FollowModule {}
