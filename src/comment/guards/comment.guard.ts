import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentService } from '@src/comment/comment.service';

@Injectable()
export class CommentGuard implements CanActivate {
  constructor(private readonly commentService: CommentService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const commentId = request.params.id;

    const comment = await this.commentService.findOne(commentId);

    if (!comment) {
      throw new NotFoundException();
    }

    return request.user.id === comment.userId;
  }
}
