import { INestApplication } from '@nestjs/common';
import { Knex } from 'knex';
import * as request from 'supertest';
import { initialize } from '@src/initialize';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { userFactory } from '@src/util/factories/user.factory';
import { tokenFactory } from '@src/util/factories/token.factory';
import { hash } from 'argon2';

describe('AuthController', () => {
  let app: INestApplication;
  let knex: Knex;

  const user = userFactory.build();
  const tokens = tokenFactory
    .params({ context: 'access', userId: user.id })
    .buildList(4);

  beforeAll(async () => {
    app = await initialize({ logger: false });
    knex = app.get(KNEX_CONNECTION);

    await knex('users').insert({
      ...user,
      password: await hash(user.password),
    });

    await knex('user_tokens').insert(tokens);

    await app.init();
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should return the user with the access token', async () => {
      const { id, ...registerData } = userFactory.build();

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData);

      expect(response.statusCode).toBe(201);

      expect(response.body.data).toMatchObject({
        user: {
          email: registerData.email,
          username: registerData.username,
        },
      });

      expect(response.body.data.accessToken).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return the user with the access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: user.password,
        });

      expect(response.statusCode).toBe(201);

      expect(response.body.data).toMatchObject({
        user: {
          email: user.email,
          username: user.username,
        },
      });

      expect(response.body.data.accessToken).toBeDefined();
    });
  });

  describe('DELETE /api/auth/logout', () => {
    it('should log the user out', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/auth/logout')
        .set('authorization', tokens[0].value);

      expect(response.body.success).toBe(true);
    });

    it('should log the user out from all devices', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/auth/logout?all=true')
        .set('authorization', tokens[1].value);

      expect(response.body.success).toBe(true);
    });

    it('should apply guard', async () => {
      const responseWithoutToken = await request(app.getHttpServer()).delete(
        '/api/auth/logout'
      );

      const responseWithInvalidToken = await request(app.getHttpServer())
        .delete('/api/auth/logout')
        .set('authorization', 'asdfasdfasdf');

      expect(responseWithoutToken.unauthorized).toBe(true);

      expect(responseWithInvalidToken.forbidden).toBe(true);
    });
  });
});
