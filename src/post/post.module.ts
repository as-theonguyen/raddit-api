import { Module } from '@nestjs/common';
import { PostService } from '@src/post/post.service';

@Module({
  providers: [PostService],
})
export class PostModule {}
