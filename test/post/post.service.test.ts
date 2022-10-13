import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { PostService } from '@src/post/post.service';
import { KnexModule, KNEX_CONNECTION } from '@src/knex/knex.module';
import knexConfig from '@src/config/knexfile';
import { userFactory } from '@test/factories/user.factory';
import { postFactory } from '@test/factories/post.factory';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';

describe('PostService', () => {
  let postService: PostService;
  let knex: Knex;

  const user = userFactory.build();

  const posts = postFactory
    .params({
      userId: user.id,
    })
    .buildList(4);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [KnexModule.forRoot(knexConfig.test)],
      providers: [PostService],
    }).compile();

    postService = module.get(PostService);
    knex = module.get(KNEX_CONNECTION);

    await knex('users').insert(user);

    await knex('posts').insert(posts);
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
  });

  describe('findOne', () => {
    it('should find and return the post by id', async () => {
      const result = await postService.findOne(posts[0].id);
      expect(result).toMatchObject(posts[0]);
    });

    it('should return null if no post was found', async () => {
      const result = await postService.findOne(v4());
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all posts in the database', async () => {
      const result = await postService.findAll();
      expect(result).toMatchObject(posts);
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
