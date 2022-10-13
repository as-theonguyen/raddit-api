import { Module } from '@nestjs/common';
import { PostService } from '@src/post/post.service';
import { PostController } from '@src/post/post.controller';
import { UserModule } from '@src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
