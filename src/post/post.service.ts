import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { v4 } from 'uuid';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { CreatePostDTO } from '@src/post/dto/create-post.dto';
import { UpdatePostDTO } from '@src/post/dto/update-post.dto';
import { PaginationQueryParams } from '@src/common/pagination-options.query';

@Injectable()
export class PostService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async findOne(id: string) {
    const [post] = await this.knex
      .select([
        'p.id',
        'p.title',
        'p.content',
        'p.createdAt',
        'u.id as uid',
        'u.username',
      ])
      .from('posts as p')
      .join('users as u', 'u.id', '=', 'p.userId')
      .where('p.id', '=', id);

    if (!post) {
      return null;
    }

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      user: {
        id: post.uid,
        username: post.username,
      },
    };
  }

  async findAll(params?: PaginationQueryParams) {
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    const posts = await this.knex
      .select([
        'p.id',
        'p.title',
        'p.content',
        'p.createdAt',
        'u.id as uid',
        'u.username',
      ])
      .from('posts as p')
      .join('users as u', 'u.id', '=', 'p.userId')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      createdAt: p.createdAt,
      user: {
        id: p.uid,
        username: p.username,
      },
    }));
  }

  async create(userId: string, input: CreatePostDTO) {
    const postId = v4();

    const [createdPost] = await this.knex('posts')
      .insert({
        id: postId,
        userId,
        title: input.title,
        content: input.content,
      })
      .returning('*');

    return createdPost;
  }

  async updateOne(id: string, input: UpdatePostDTO) {
    const [updatedPost] = await this.knex('posts')
      .update(input)
      .where('id', '=', id)
      .returning('*');

    return updatedPost;
  }

  async deleteOne(id: string) {
    try {
      await this.knex('posts').delete().where('id', '=', id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
