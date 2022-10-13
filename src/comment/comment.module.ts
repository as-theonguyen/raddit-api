import { Module } from '@nestjs/common';
import { CommentService } from '@src/comment/comment.service';

@Module({
  providers: [CommentService],
})
export class CommentModule {}
