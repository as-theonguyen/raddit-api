import { Module } from '@nestjs/common';
import { AuthService } from '@src/auth/auth.service';
import { AuthController } from '@src/auth/auth.controller';
import { UtilModule } from '@src/util/util.module';
import { UserModule } from '@src/user/user.module';

@Module({
  imports: [UtilModule, UserModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
