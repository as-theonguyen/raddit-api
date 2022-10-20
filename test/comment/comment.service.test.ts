import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import { v4 } from 'uuid';
import { KnexModule, KNEX_CONNECTION } from '@src/knex/knex.module';
import knexConfig from '@src/config/knexfile';
import { userFactory } from '@src/util/factories/user.factory';
import { postFactory } from '@src/util/factories/post.factory';
import { commentFactory } from '@src/util/factories/comment.factory';
import { CommentService } from '@src/comment/comment.service';

describe('CommentService', () => {
  let commentService: CommentService;
  let knex: Knex;

  const user = userFactory.build();
  const commenter = userFactory.build();

  const post = postFactory
    .params({
      userId: user.id,
    })
    .build();

  const comments = commentFactory
    .params({ userId: commenter.id, postId: post.id })
    .buildList(4);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [KnexModule.forRoot(knexConfig.test)],
      providers: [CommentService],
    }).compile();

    commentService = module.get(CommentService);
    knex = module.get(KNEX_CONNECTION);

    await knex('users').insert([user, commenter]);

    await knex('posts').insert(post);

    await knex('comments').insert(comments);
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
  });

  describe('findAllCommentsByPost', () => {
    it('should find and return all comments belong to the post', async () => {
      const result = await commentService.findAllCommentsByPost(post.id);

      const commentShapes = comments.map((c) => ({
        id: c.id,
        content: c.content,
        user: {
          id: commenter.id,
          username: commenter.username,
        },
      }));

      expect(result.sort((a, b) => a.id.localeCompare(b.id))).toMatchObject(
        commentShapes.sort((a, b) => a.id.localeCompare(b.id))
      );
    });
  });

  describe('findOne', () => {
    it('should find and return the comment by id', async () => {
      const result = await commentService.findOne(comments[0].id);
      expect(result).toMatchObject(comments[0]);
    });

    it('should return null if no comment was found', async () => {
      const result = await commentService.findOne(v4());
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return the comment', async () => {
      const createCommentData = {
        content: faker.lorem.sentence(),
      };

      const result = await commentService.create(
        commenter.id,
        post.id,
        createCommentData
      );

      expect(result).toMatchObject({
        content: createCommentData.content,
        user: {
          id: commenter.id,
          username: commenter.username,
        },
      });

      const [commentInDb] = await knex('comments')
        .select('*')
        .where('id', '=', result.id)
        .andWhere('postId', '=', post.id);

      expect(commentInDb).toMatchObject({
        id: result.id,
        content: createCommentData.content,
        userId: commenter.id,
        postId: post.id,
      });
    });
  });

  describe('deleteOne', () => {
    it('should delete the commment', async () => {
      const result = await commentService.deleteOne({ id: comments[0].id });

      expect(result).toBe(true);

      const [deletedComment] = await knex('comments')
        .select('*')
        .where('id', '=', comments[0].id);

      expect(deletedComment).toBeUndefined();
    });
  });
});
