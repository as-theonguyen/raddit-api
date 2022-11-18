import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { v4 } from 'uuid';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { CreateCommentDTO } from '@src/comment/dto/create-comment.dto';
import { DeleteCommentDTO } from '@src/comment/dto/delete-comment.dto';
import { PaginationQueryParams } from '@src/common/pagination-options.query';

@Injectable()
export class CommentService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async findAllCommentsByPost(postId: string, params?: PaginationQueryParams) {
    const limit = params?.limit || 10;
    const offset = params?.offset || 0;

    const comments = await this.knex
      .select(['c.id', 'c.content', 'u.id as uid', 'u.username'])
      .from('comments as c')
      .join('users as u', 'u.id', '=', 'c.userId')
      .where('c.postId', '=', postId)
      .orderBy('c.createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      user: {
        id: c.uid,
        username: c.username,
      },
    }));
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
    const result = await this.knex.transaction(async (trx) => {
      try {
        const id = v4();

        const [comment] = await this.knex('comments')
          .insert({
            id,
            userId,
            postId,
            content: input.content,
          })
          .returning(['id', 'content']);

        const [user] = await this.knex('users')
          .select(['id', 'username'])
          .where('id', '=', userId);

        await trx.commit([comment, user]);
      } catch (error) {
        await trx.rollback(error);
      }
    });

    return {
      id: result[0].id,
      content: result[0].content,
      user: {
        id: result[1].id,
        username: result[1].username,
      },
    };
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
