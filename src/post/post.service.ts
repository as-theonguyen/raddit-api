import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { v4 } from 'uuid';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { CreatePostDTO } from '@src/post/dto/create-post.dto';
import { UpdatePostDTO } from '@src/post/dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async findOne(id: string) {
    const [post] = await this.knex('posts').select('*').where('id', '=', id);

    if (!post) {
      return null;
    }

    return post;
  }

  async findAll() {
    const posts = await this.knex('posts').select('*');
    return posts;
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
