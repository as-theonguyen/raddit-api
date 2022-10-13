import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { FollowService } from '@src/follow/follow.service';
import { KnexModule, KNEX_CONNECTION } from '@src/knex/knex.module';
import knexConfig from '@src/config/knexfile';
import { userFactory } from '@test/factories/user.factory';

describe('FollowService', () => {
  let followService: FollowService;
  let knex: Knex;

  const follower = userFactory.build();
  const followee = userFactory.build();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [KnexModule.forRoot(knexConfig.test)],
      providers: [FollowService],
    }).compile();

    followService = module.get(FollowService);
    knex = module.get(KNEX_CONNECTION);

    await knex('users').insert([follower, followee]);
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
  });

  describe('follow', () => {
    it('should create a new entry in the database', async () => {
      const result = await followService.follow({
        followerId: follower.id,
        followeeId: followee.id,
      });

      expect(result).toBe(true);

      const [followInDb] = await knex('follows')
        .select('*')
        .where('followerId', '=', follower.id)
        .andWhere('followeeId', '=', followee.id);

      expect(followInDb).toBeDefined();
    });
  });

  describe('unfollow', () => {
    it('should delete the entry from the database', async () => {
      const result = await followService.unfollow({
        followerId: follower.id,
        followeeId: followee.id,
      });

      expect(result).toBe(true);

      const [followInDb] = await knex('follows')
        .select('*')
        .where('followerId', '=', follower.id)
        .andWhere('followeeId', '=', followee.id);

      expect(followInDb).toBeUndefined();
    });
  });
});
