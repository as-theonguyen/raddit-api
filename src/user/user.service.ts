import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from 'argon2';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { UpdateUserDTO } from '@src/user/dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async getFeed(id: string) {
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
      .join('follows as f', 'u.id', '=', 'f.followeeId')
      .where('f.followerId', '=', id)
      .orderBy('p.createdAt', 'desc');

    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      user: {
        id: p.uid,
        username: p.username,
      },
    }));
  }

  async findAll() {
    const users = await this.knex('users')
      .select(['id', 'email', 'username'])
      .orderBy('createdAt', 'desc');

    return users;
  }

  async findOne(id: string) {
    const result = await this.knex.transaction(async (trx) => {
      try {
        const [user] = await trx('users')
          .select(['id', 'username', 'email'])
          .where('id', '=', id);

        if (!user) {
          throw new NotFoundException();
        }

        const [followerCount] = await trx('follows')
          .count('* as count')
          .where('followeeId', '=', user.id);

        const [followeeCount] = await trx('follows')
          .count('* as count')
          .where('followerId', '=', user.id);

        await trx.commit([user, followerCount, followeeCount]);
      } catch (error) {
        await trx.rollback(error);
      }
    });

    return {
      user: result[0],
      followerCount: +result[1].count,
      followeeCount: +result[2].count,
    };
  }

  async findByToken(token: string, context: string = 'access') {
    const [user] = await this.knex
      .select('u.*')
      .from('users as u')
      .join('user_tokens as t', 'u.id', '=', 't.userId')
      .where('t.value', '=', token)
      .andWhere('t.context', '=', context);

    if (!user) {
      return null;
    }

    return user;
  }

  async updateOne(id: string, { currentPassword, ...input }: UpdateUserDTO) {
    const result = await this.knex.transaction(async (trx) => {
      try {
        const [user] = await trx('users').select('*').where('id', '=', id);

        if (!user) {
          throw new NotFoundException('User not found');
        }

        const match = await verify(user.password, currentPassword);

        if (!match) {
          throw new UnauthorizedException('Invalid credentials');
        }

        let newPassword: string | null | undefined;

        if (input.password) {
          newPassword = await hash(input.password);
        }

        const [updatedUser] = await trx('users')
          .update({
            ...input,
            password: newPassword,
          })
          .where('id', '=', id)
          .returning(['id', 'email', 'username']);

        await trx.commit([updatedUser]);
      } catch (error) {
        await trx.rollback(error);
      }
    });

    return result[0];
  }

  async deleteOne(id: string) {
    try {
      await this.knex('users').delete().where('id', '=', id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
