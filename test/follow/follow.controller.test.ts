import { INestApplication } from '@nestjs/common';
import { Knex } from 'knex';
import * as request from 'supertest';
import { initialize } from '@src/initialize';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { userFactory } from '@src/util/factories/user.factory';
import { tokenFactory } from '@src/util/factories/token.factory';

describe('FollowController', () => {
  let app: INestApplication;
  let knex: Knex;

  const follower = userFactory.build();
  const followee = userFactory.build();

  const followerToken = tokenFactory
    .params({ context: 'access', userId: follower.id })
    .build();

  const followeeToken = tokenFactory
    .params({ context: 'access', userId: followee.id })
    .build();

  beforeAll(async () => {
    app = await initialize({ logger: false });
    knex = app.get(KNEX_CONNECTION);

    await knex('users').insert([follower, followee]);

    await knex('user_tokens').insert([followerToken, followeeToken]);

    await app.init();
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
    await app.close();
  });

  describe('POST /api/follows', () => {
    it('should follow', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/follows')
        .send({
          followeeId: followee.id,
        })
        .set('authorization', followerToken.value);

      expect(response.statusCode).toBe(201);

      expect(response.body.success).toBe(true);
    });

    it('should apply guard', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/follows')
        .send({
          followeeId: followee.id,
        });

      expect(response.unauthorized).toBe(true);
    });
  });

  describe('DELETE /api/follows/:followeeId', () => {
    it('should unfollow', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/follows/${followee.id}`)
        .set('authorization', followerToken.value);

      expect(response.noContent).toBe(true);
    });

    it('should apply guard', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/api/follows/${followee.id}`
      );

      expect(response.unauthorized).toBe(true);
    });
  });
});
