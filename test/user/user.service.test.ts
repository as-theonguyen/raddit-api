import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { v4 } from 'uuid';
import { hash, verify } from 'argon2';
import { UserService } from '@src/user/user.service';
import { tokenFactory } from '@test/factories/token.factory';
import { userFactory } from '@test/factories/user.factory';
import { KnexModule, KNEX_CONNECTION } from '@src/knex/knex.module';
import knexConfig from '@src/config/knexfile';
import { postFactory } from '@test/factories/post.factory';
import { followFactory } from '@test/factories/follow.factory';

describe('UserService', () => {
  let userService: UserService;
  let knex: Knex;

  const user = userFactory.build();

  const followee = userFactory.build();

  const tokens = tokenFactory
    .params({
      context: 'access',
      userId: user.id,
    })
    .buildList(4);

  const posts = postFactory.params({ userId: followee.id }).buildList(3);

  const follow = followFactory
    .params({ followeeId: followee.id, followerId: user.id })
    .build();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [KnexModule.forRoot(knexConfig.test)],
      providers: [UserService],
    }).compile();

    userService = module.get(UserService);
    knex = module.get(KNEX_CONNECTION);

    await knex('users').insert([
      {
        ...user,
        password: await hash(user.password),
      },
      followee,
    ]);

    await knex('user_tokens').insert(tokens);

    await knex('posts').insert(posts);

    await knex('follows').insert(follow);
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
  });

  describe('getFeed', () => {
    it("should return all the posts that belong the user's followees", async () => {
      const result = await userService.getFeed(user.id);

      const postShapes = posts.map(({ userId, ...p }) => ({
        ...p,
        user: {
          id: followee.id,
          username: followee.username,
        },
      }));

      expect(result).toMatchObject(postShapes);
    });
  });

  describe('findOne', () => {
    it('should find and return the user by the given params', async () => {
      const followerResult = await userService.findOne(user.id);
      const followeeResult = await userService.findOne(followee.id);

      expect(followerResult).toMatchObject({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        followerCount: 0,
        followeeCount: 1,
      });

      expect(followeeResult).toMatchObject({
        user: {
          id: followee.id,
          email: followee.email,
          username: followee.username,
        },
        followerCount: 1,
        followeeCount: 0,
      });
    });

    it('should return null if the was no user found', async () => {
      await expect(userService.findOne(v4())).rejects.toThrow();
    });
  });

  describe('findByToken', () => {
    it('should find and return the user by the token', async () => {
      const result = await userService.findByToken(tokens[0].value);

      expect(result).toMatchObject({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    });

    it('should return null if no user was found', async () => {
      const result = await userService.findByToken('notexist');

      expect(result).toBeNull();
    });
  });

  describe('updateOne', () => {
    it('should find and update the user', async () => {
      const result = await userService.updateOne(user.id, {
        email: 'new@email.com',
        password: 'newpassword',
        currentPassword: user.password,
      });

      const [userInDb] = await knex('users')
        .select('*')
        .where('id', '=', user.id);

      const match = await verify(userInDb.password, 'newpassword');

      expect(match).toBe(true);
      expect(userInDb).toMatchObject(result);
    });

    it('should check the current password', async () => {
      await expect(
        userService.updateOne(user.id, {
          username: 'asdf',
          currentPassword: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('deleteOne', () => {
    it('should delete the user', async () => {
      const result = await userService.deleteOne(user.id);

      expect(result).toBe(true);

      const [userInDb] = await knex('users')
        .select('*')
        .where('id', '=', user.id);

      expect(userInDb).toBeUndefined();
    });
  });
});
