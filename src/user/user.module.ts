import { Module } from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import { UserController } from '@src/user/user.controller';

@Module({
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
