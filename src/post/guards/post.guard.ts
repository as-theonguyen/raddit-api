import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostService } from '@src/post/post.service';

@Injectable()
export class PostGuard implements CanActivate {
  constructor(private readonly postService: PostService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const id = request.params.id;

    const post = await this.postService.findOne(id);

    if (!post) {
      throw new NotFoundException();
    }

    return post.user.id === request.user.id;
  }
}
