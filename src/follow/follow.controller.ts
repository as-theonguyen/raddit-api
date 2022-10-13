import { Controller, Delete, Post } from '@nestjs/common';
import { FollowService } from '@src/follow/follow.service';

@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('')
  async create() {}

  @Delete('')
  async destroy() {}
}
