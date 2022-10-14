import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { v4 } from 'uuid';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { CreateCommentDTO } from '@src/comment/dto/create-comment.dto';
import { DeleteCommentDTO } from '@src/comment/dto/delete-comment.dto';

@Injectable()
export class CommentService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async findAllCommentsByPost(postId: string) {
    const comments = await this.knex('comments')
      .select('*')
      .where('postId', '=', postId);

    return comments;
  }

  async findOne(id: string) {
    const [comment] = await this.knex('comments')
      .select('*')
      .where('id', '=', id);

    if (!comment) {
      return null;
    }

    return comment;
  }

  async create(userId: string, postId: string, input: CreateCommentDTO) {
    const id = v4();

    const [comment] = await this.knex('comments')
      .insert({
        id,
        userId,
        postId,
        content: input.content,
      })
      .returning('*');

    return comment;
  }

  async deleteOne(input: DeleteCommentDTO) {
    try {
      await this.knex('comments').delete().where('id', '=', input.id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
