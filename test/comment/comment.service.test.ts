import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import { v4 } from 'uuid';
import { KnexModule, KNEX_CONNECTION } from '@src/knex/knex.module';
import knexConfig from '@src/config/knexfile';
import { userFactory } from '@test/factories/user.factory';
import { postFactory } from '@test/factories/post.factory';
import { commentFactory } from '@test/factories/comment.factory';
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
      expect(result).toMatchObject(comments);
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
        userId: commenter.id,
        postId: post.id,
        content: createCommentData.content,
      });

      const [commentInDb] = await knex('comments')
        .select('*')
        .where('id', '=', result.id)
        .andWhere('postId', '=', post.id);

      expect(commentInDb).toMatchObject(result);
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
