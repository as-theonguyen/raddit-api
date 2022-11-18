import { Request } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import { UpdateUserDTO } from '@src/user/dto/update-user.dto';
import { AuthGuard } from '@src/auth/guards/auth.guard';
import { UserGuard } from '@src/user/guards/user.guard';
import { FollowService } from '@src/follow/follow.service';
import { PaginationQueryParams } from '@src/common/pagination-options.query';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly followService: FollowService
  ) {}

  @Get('me')
  async me(@Req() req: Request) {
    return {
      data: req.user,
    };
  }

  @Get(':id/feed')
  @UseGuards(AuthGuard, UserGuard)
  async feed(
    @Param('id') id: string,
    @Query() queryParams?: PaginationQueryParams
  ) {
    const feed = await this.userService.getFeed(id, queryParams);
    return { data: feed };
  }

  @Get(':id/followers')
  async getFollowers(
    @Param('id') id: string,
    @Query() queryParams?: PaginationQueryParams
  ) {
    const followers = await this.followService.getFollowers(id, queryParams);
    return { data: followers };
  }

  @Get(':id/followees')
  async getFollowees(
    @Param('id') id: string,
    @Query() queryParams?: PaginationQueryParams
  ) {
    const followees = await this.followService.getFollowees(id, queryParams);
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
  async destroy(@Param('id') id: string) {
    const result = await this.userService.deleteOne(id);
    return { success: result };
  }
}
