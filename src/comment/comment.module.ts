import { Module } from '@nestjs/common';
import { CommentService } from '@src/comment/comment.service';
import {
  CommentController,
  PostCommentController,
} from '@src/comment/comment.controller';
import { UserModule } from '@src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [CommentService],
  controllers: [PostCommentController, CommentController],
})
export class CommentModule {}
