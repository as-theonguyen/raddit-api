import { Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Headers,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '@src/auth/auth.service';
import { RegisterDTO } from '@src/auth/dto/register.dto';
import { LoginDTO } from '@src/auth/dto/login.dto';
import { AuthGuard } from '@src/auth/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() input: RegisterDTO
  ) {
    const { user, accessToken } = await this.authService.register(input);
    res.statusCode = 201;
    return {
      data: {
        user,
        accessToken,
      },
    };
  }

  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() input: LoginDTO
  ) {
    const { user, accessToken } = await this.authService.login(input);
    res.statusCode = 201;
    return {
      data: {
        user,
        accessToken,
      },
    };
  }

  @Delete('logout')
  @UseGuards(AuthGuard)
  async logout(
    @Query() query: { all: string },
    @Headers('authorization') token: string
  ) {
    let result: boolean;

    if (query.all === 'true') {
      result = await this.authService.logoutFromAllDevices(token);
    } else {
      result = await this.authService.logout(token);
    }

    return { success: result };
  }
}
