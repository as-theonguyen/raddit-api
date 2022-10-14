import { Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import { UpdateUserDTO } from '@src/user/dto/update-user.dto';
import { AuthGuard } from '@src/auth/guards/auth.guard';
import { UserGuard } from '@src/user/guards/user.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id/feed')
  @UseGuards(AuthGuard, UserGuard)
  async feed(@Param('id') id: string) {
    const feed = await this.userService.getFeed(id);
    return { feed };
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return user;
  }

  @Patch(':id')
  @UseGuards(AuthGuard, UserGuard)
  async update(@Param('id') id: string, @Body() input: UpdateUserDTO) {
    const updatedUser = await this.userService.updateOne(id, input);
    return { user: updatedUser };
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
