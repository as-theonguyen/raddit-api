import { Module } from '@nestjs/common';
import { CommentService } from '@src/comment/comment.service';
import { CommentController } from '@src/comment/comment.controller';
import { UserModule } from '@src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
