import { INestApplication } from '@nestjs/common';
import { Knex } from 'knex';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { initialize } from '@src/initialize';
import { KNEX_CONNECTION } from '@src/knex/knex.module';
import { userFactory } from '@test/factories/user.factory';
import { tokenFactory } from '@test/factories/token.factory';
import { postFactory } from '@test/factories/post.factory';
import { commentFactory } from '@test/factories/comment.factory';

describe('CommentController', () => {
  let app: INestApplication;
  let knex: Knex;

  const poster = userFactory.build();
  const commenter = userFactory.build();

  const posterToken = tokenFactory
    .params({ context: 'access', userId: poster.id })
    .build();

  const commenterToken = tokenFactory
    .params({ context: 'access', userId: commenter.id })
    .build();

  const post = postFactory.params({ userId: poster.id }).build();

  const comments = commentFactory
    .params({ postId: post.id, userId: commenter.id })
    .buildList(3);

  beforeAll(async () => {
    app = await initialize({ logger: false });
    knex = app.get(KNEX_CONNECTION);

    await knex('users').insert([poster, commenter]);

    await knex('user_tokens').insert([posterToken, commenterToken]);

    await knex('posts').insert(post);

    await knex('comments').insert(comments);

    await app.init();
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
    await app.close();
  });

  describe('GET /api/posts/:postId/comments', () => {
    it('should return all comments belong to the post', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/posts/${post.id}/comments`
      );

      const commentShapes = comments.map((c) => ({
        id: c.id,
        content: c.content,
        user: {
          id: commenter.id,
          username: commenter.username,
        },
      }));

      expect(
        response.body.data.sort((a, b) => a.id.localeCompare(b.id))
      ).toMatchObject(commentShapes.sort((a, b) => a.id.localeCompare(b.id)));
    });
  });

  describe('POST /api/posts/:postId/comments', () => {
    it('should return the created comments', async () => {
      const createCommentData = {
        content: faker.lorem.sentence(),
      };

      const response = await request(app.getHttpServer())
        .post(`/api/posts/${post.id}/comments`)
        .send(createCommentData)
        .set('authorization', commenterToken.value);

      expect(response.body.data).toMatchObject({
        content: createCommentData.content,
        user: {
          id: commenter.id,
          username: commenter.username,
        },
      });
    });

    it('should apply guard', async () => {
      const createCommentData = {
        content: faker.lorem.sentence(),
      };

      const response = await request(app.getHttpServer())
        .post(`/api/posts/${post.id}/comments`)
        .send(createCommentData);

      expect(response.unauthorized).toBe(true);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('should delete the comment', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/comments/${comments[0].id}`)
        .set('authorization', commenterToken.value);

      expect(response.noContent).toBe(true);
    });

    it('should apply guard', async () => {
      const responseWithoutToken = await request(app.getHttpServer()).delete(
        `/api/comments/${comments[1].id}`
      );

      expect(responseWithoutToken.unauthorized).toBe(true);

      const responseWithWrongToken = await request(app.getHttpServer())
        .delete(`/api/comments/${comments[1].id}`)
        .set('authorization', posterToken.value);

      expect(responseWithWrongToken.forbidden).toBe(true);
    });
  });
});
