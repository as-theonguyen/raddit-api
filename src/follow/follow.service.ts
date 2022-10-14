import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { v4 } from 'uuid';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { FollowDTO } from '@src/follow/dto/follow.dto';

@Injectable()
export class FollowService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async getFollowers(id: string) {}

  async getFollowees(id: string) {}

  async follow({ followeeId, followerId }: FollowDTO) {
    const id = v4();

    try {
      await this.knex('follows').insert({
        id,
        followeeId,
        followerId,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  async unfollow({ followeeId, followerId }: FollowDTO) {
    try {
      await this.knex('follows')
        .delete()
        .where('followerId', '=', followerId)
        .andWhere('followeeId', '=', followeeId);

      return true;
    } catch (error) {
      return false;
    }
  }
}
