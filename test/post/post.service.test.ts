import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { PostService } from '@src/post/post.service';
import { KnexModule, KNEX_CONNECTION } from '@src/knex/knex.module';
import knexConfig from '@src/config/knexfile';
import { userFactory } from '@src/util/factories/user.factory';
import { postFactory } from '@src/util/factories/post.factory';

describe('PostService', () => {
  let postService: PostService;
  let knex: Knex;

  const user = userFactory.build();
  const otherUser = userFactory.build();

  const posts = postFactory
    .params({
      userId: user.id,
    })
    .buildList(4);

  const otherPost = postFactory
    .params({
      userId: otherUser.id,
    })
    .build();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [KnexModule.forRoot(knexConfig.test)],
      providers: [PostService],
    }).compile();

    postService = module.get(PostService);
    knex = module.get(KNEX_CONNECTION);

    await knex('users').insert([user, otherUser]);

    await knex('posts').insert([...posts, otherPost]);
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
  });

  describe('findOne', () => {
    it('should find and return the post by id', async () => {
      const result = await postService.findOne(posts[0].id);

      expect(result).toMatchObject({
        id: posts[0].id,
        title: posts[0].title,
        content: posts[0].content,
        user: {
          id: user.id,
          username: user.username,
        },
      });
    });

    it('should return null if no post was found', async () => {
      const result = await postService.findOne(v4());
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all posts in the database', async () => {
      const result = await postService.findAll();

      const postShapes = posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        user: {
          id: user.id,
          username: user.username,
        },
      }));

      const otherPostShape = {
        id: otherPost.id,
        title: otherPost.title,
        content: otherPost.content,
        user: {
          id: otherUser.id,
          username: otherUser.username,
        },
      };

      expect(result.sort((a, b) => a.id.localeCompare(b.id))).toMatchObject(
        postShapes
          .concat(otherPostShape)
          .sort((a, b) => a.id.localeCompare(b.id))
      );
    });
  });

  describe('findAllByUser', () => {
    it('should find and return all posts by user', async () => {
      const result = await postService.findAllByUser(user.id);

      const postShapes = posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        user: {
          id: user.id,
          username: user.username,
        },
      }));

      expect(result.sort((a, b) => a.id.localeCompare(b.id))).toMatchObject(
        postShapes.sort((a, b) => a.id.localeCompare(b.id))
      );

      const otherMatch = result.some((p) => p.id === otherPost.id);

      expect(otherMatch).toBe(false);
    });
  });

  describe('create', () => {
    it('should create and return the post', async () => {
      const createPostData = {
        title: faker.lorem.words(),
        content: faker.lorem.paragraph(),
      };

      const result = await postService.create(user.id, createPostData);

      expect(result).toMatchObject(createPostData);

      const [postInDb] = await knex('posts')
        .select(['title', 'content'])
        .where('id', '=', result.id);

      expect(postInDb).toMatchObject(createPostData);
    });
  });

  describe('updateOne', () => {
    it('should update and return the post', async () => {
      const result = await postService.updateOne(posts[1].id, {
        title: 'newtitle',
      });

      expect(result).toMatchObject({
        id: posts[1].id,
        title: 'newtitle',
        content: posts[1].content,
      });

      const [updatedPostInDb] = await knex('posts')
        .select(['title'])
        .where('id', '=', posts[1].id);

      expect(updatedPostInDb.title).toBe('newtitle');
    });
  });

  describe('deleteOne', () => {
    it('should delete the post', async () => {
      const result = await postService.deleteOne(posts[0].id);

      expect(result).toBe(true);

      const [postInDb] = await knex('posts')
        .select('*')
        .where('id', '=', posts[0].id);

      expect(postInDb).toBeUndefined();
    });
  });
});
