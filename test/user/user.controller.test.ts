import { INestApplication } from '@nestjs/common';
import { hash } from 'argon2';
import { Knex } from 'knex';
import * as request from 'supertest';
import { initialize } from '@src/initialize';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { userFactory } from '@test/factories/user.factory';
import { tokenFactory } from '@test/factories/token.factory';
import { postFactory } from '@test/factories/post.factory';
import { followFactory } from '@test/factories/follow.factory';

describe('UserController', () => {
  let app: INestApplication;
  let knex: Knex;

  const user = userFactory.build();
  const user2 = userFactory.build();

  const tokens = tokenFactory
    .params({ context: 'access', userId: user.id })
    .buildList(4);

  const tokens2 = tokenFactory
    .params({ context: 'access', userId: user2.id })
    .buildList(4);

  const posts = postFactory.params({ userId: user.id }).buildList(4);
  const follow = followFactory
    .params({ followerId: user2.id, followeeId: user.id })
    .build();

  beforeAll(async () => {
    app = await initialize({ logger: false });
    knex = app.get(KNEX_CONNECTION);

    await knex('users').insert([
      {
        ...user,
        password: await hash(user.password),
      },
      {
        ...user2,
        password: await hash(user2.password),
      },
    ]);

    await knex('user_tokens').insert([...tokens, ...tokens2]);

    await knex('posts').insert(posts);

    await knex('follows').insert(follow);

    await app.init();
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
    await app.close();
  });

  describe('GET /api/users/me', () => {
    it('should return the current user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('authorization', tokens[0].value);

      expect(response.body.data).toMatchObject({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    });

    it('should apply guard', async () => {
      const response = await request(app.getHttpServer()).get('/api/users/me');

      expect(response.unauthorized).toBe(true);
    });
  });

  describe('GET /api/users/:id/feed', () => {
    it('should return the user feed', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${user2.id}/feed`)
        .set('authorization', tokens2[0].value);

      const postShapes = posts.map(({ userId, ...p }) => ({
        ...p,
        user: {
          id: user.id,
          username: user.username,
        },
      }));

      expect(response.body.data).toMatchObject(postShapes);
    });

    it('should apply guard', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${user2.id}/feed`)
        .set('authorization', tokens[0].value);

      expect(response.forbidden).toBe(true);
    });
  });

  describe('GET /api/users/:id/followers', () => {
    it('should return all followers', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/users/${user.id}/followers`
      );

      const noFollowerResponse = await request(app.getHttpServer()).get(
        `/api/users/${user2.id}/followers`
      );

      expect(response.body.data).toMatchObject([
        {
          id: user2.id,
          email: user2.email,
          username: user2.username,
        },
      ]);
      expect(noFollowerResponse.body.data).toMatchObject([]);
    });
  });

  describe('GET /api/users/:id/followees', () => {
    it('should return all followees', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/users/${user2.id}/followees`
      );

      const noFolloweeResponse = await request(app.getHttpServer()).get(
        `/api/users/${user.id}/followees`
      );

      expect(response.body.data).toMatchObject([
        {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      ]);
      expect(noFolloweeResponse.body.data).toMatchObject([]);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return the user', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/users/${user.id}`
      );

      expect(response.body.data).toMatchObject({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        followerCount: 1,
        followeeCount: 0,
      });
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should return the updated user', async () => {
      const updateUserData = {
        email: 'new@email.com',
        currentPassword: user.password,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/users/${user.id}`)
        .send(updateUserData)
        .set('authorization', tokens[0].value);

      expect(response.body.data).toMatchObject({
        id: user.id,
        email: updateUserData.email,
        username: user.username,
      });
    });

    it('should apply guard', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${user.id}`)
        .send({
          username: 'newusername',
          currentPassword: user.password,
        })
        .set('authorization', tokens2[0].value);

      expect(response.forbidden).toBe(true);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete the user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/users/${user.id}`)
        .set('authorization', tokens[0].value);

      expect(response.statusCode).toBe(204);
    });

    it('should apply guard', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/users/${user.id}`)
        .set('authorization', tokens2[0].value);

      expect(response.forbidden).toBe(true);
    });
  });
});
