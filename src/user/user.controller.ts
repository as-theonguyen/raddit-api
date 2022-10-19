import { Request, Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import { UpdateUserDTO } from '@src/user/dto/update-user.dto';
import { AuthGuard } from '@src/auth/guards/auth.guard';
import { UserGuard } from '@src/user/guards/user.guard';
import { FollowService } from '@src/follow/follow.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly followService: FollowService
  ) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    return {
      data: req.user,
    };
  }

  @Get(':id/feed')
  @UseGuards(AuthGuard, UserGuard)
  async feed(@Param('id') id: string) {
    const feed = await this.userService.getFeed(id);
    return { data: feed };
  }

  @Get(':id/followers')
  async getFollowers(@Param('id') id: string) {
    const followers = await this.followService.getFollowers(id);
    return { data: followers };
  }

  @Get(':id/followees')
  async getFollowees(@Param('id') id: string) {
    const followees = await this.followService.getFollowees(id);
    return { data: followees };
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return { data: user };
  }

  @Patch(':id')
  @UseGuards(AuthGuard, UserGuard)
  async update(@Param('id') id: string, @Body() input: UpdateUserDTO) {
    const updatedUser = await this.userService.updateOne(id, input);
    return { data: updatedUser };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, UserGuard)
  async destroy(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string
  ) {
    await this.userService.deleteOne(id);
    res.statusCode = 204;
  }
}
