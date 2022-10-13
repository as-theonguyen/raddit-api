import { INestApplication } from '@nestjs/common';
import { hash } from 'argon2';
import { Knex } from 'knex';
import * as request from 'supertest';
import { initialize } from '@src/initialize';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { userFactory } from '@test/factories/user.factory';
import { tokenFactory } from '@test/factories/token.factory';

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

    await app.init();
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
    await app.close();
  });

  describe('GET /api/users/:id', () => {
    it('should return the user', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/users/${user.id}`
      );

      expect(response.body.user).toMatchObject({
        id: user.id,
        email: user.email,
        username: user.username,
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

      expect(response.body.user).toMatchObject({
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
