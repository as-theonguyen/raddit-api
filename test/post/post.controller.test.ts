import { INestApplication } from '@nestjs/common';
import { Knex } from 'knex';
import * as request from 'supertest';
import { initialize } from '@src/initialize';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { userFactory } from '@src/util/factories/user.factory';
import { tokenFactory } from '@src/util/factories/token.factory';
import { postFactory } from '@src/util/factories/post.factory';
import { faker } from '@faker-js/faker';

describe('PostController', () => {
  let app: INestApplication;
  let knex: Knex;

  const user = userFactory.build();
  const user2 = userFactory.build();

  const tokens = tokenFactory
    .params({ context: 'access', userId: user.id })
    .buildList(4);

  const tokens2 = tokenFactory
    .params({ context: 'access', userId: user2.id })
    .buildList(2);

  const posts = postFactory.params({ userId: user.id }).buildList(4);

  beforeAll(async () => {
    app = await initialize({ logger: false });
    knex = app.get(KNEX_CONNECTION);

    await knex('users').insert([user, user2]);

    await knex('user_tokens').insert([...tokens, ...tokens2]);

    await knex('posts').insert(posts);

    await app.init();
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
    await app.close();
  });

  describe('GET /api/users/:userId/posts', () => {
    it('should return all posts by user', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/users/${user.id}/posts`
      );

      const postShapes = posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        user: {
          id: user.id,
          username: user.username,
        },
      }));

      expect(
        response.body.data.sort((a, b) => a.id.localeCompare(b.id))
      ).toMatchObject(postShapes.sort((a, b) => a.id.localeCompare(b.id)));
    });
  });

  describe('GET /api/posts', () => {
    it('should return all posts', async () => {
      const response = await request(app.getHttpServer()).get('/api/posts');

      const postShapes = posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        user: {
          id: user.id,
          username: user.username,
        },
      }));

      expect(
        response.body.data.sort((a, b) => a.id.localeCompare(b.id))
      ).toMatchObject(postShapes.sort((a, b) => a.id.localeCompare(b.id)));
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return post by id', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/posts/${posts[0].id}`
      );

      expect(response.body.data).toMatchObject({
        id: posts[0].id,
        title: posts[0].title,
        content: posts[0].content,
        user: {
          id: user.id,
          username: user.username,
        },
      });
    });
  });

  describe('POST /api/posts', () => {
    it('should return the created post', async () => {
      const createPostData = {
        title: faker.lorem.words(),
        content: faker.lorem.paragraph(),
      };

      const response = await request(app.getHttpServer())
        .post('/api/posts')
        .send(createPostData)
        .set('authorization', tokens2[0].value);

      expect(response.body.data).toMatchObject(createPostData);
    });

    it('should apply guard', async () => {
      const createPostData = {
        title: faker.lorem.words(),
        content: faker.lorem.paragraph(),
      };

      const response = await request(app.getHttpServer())
        .post('/api/posts')
        .send(createPostData);

      expect(response.unauthorized).toBe(true);
    });
  });

  describe('PATCH /api/posts/:id', () => {
    it('should return the updated post', async () => {
      const updatePostData = {
        content: 'newcontent',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/posts/${posts[0].id}`)
        .send(updatePostData)
        .set('authorization', tokens[0].value);

      expect(response.body.data).toMatchObject({
        id: posts[0].id,
        title: posts[0].title,
        content: 'newcontent',
      });
    });

    it('should apply guard', async () => {
      const updatePostData = {
        content: 'newcontent',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/posts/${posts[1].id}`)
        .send(updatePostData)
        .set('authorization', tokens2[0].value);

      expect(response.forbidden).toBe(true);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete the user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/posts/${posts[2].id}`)
        .set('authorization', tokens[1].value);

      expect(response.body.success).toBe(true);
    });

    it('should apply guard', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/posts/${posts[3].id}`)
        .set('authorization', tokens2[0].value);

      expect(response.forbidden).toBe(true);
    });
  });
});
