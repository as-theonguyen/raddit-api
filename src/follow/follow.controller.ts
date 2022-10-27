import { Request, Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FollowService } from '@src/follow/follow.service';
import { AuthGuard } from '@src/auth/guards/auth.guard';

@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('')
  @UseGuards(AuthGuard)
  async create(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('followeeId') followeeId: string
  ) {
    const result = await this.followService.follow({
      followeeId,
      followerId: req.user!.id,
    });

    res.statusCode = 201;

    return { success: result };
  }

  @Delete(':followeeId')
  @UseGuards(AuthGuard)
  async destroy(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('followeeId') followeeId: string
  ) {
    const result = await this.followService.unfollow({
      followeeId,
      followerId: req.user!.id,
    });

    return { success: result };
  }
}
