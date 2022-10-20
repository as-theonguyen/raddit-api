import { Knex } from 'knex';
import { hash } from 'argon2';
import { User } from '../../user/types/user';
import { userFactory } from '../../util/factories/user.factory';
import { postFactory } from '../../util/factories/post.factory';
import { followFactory } from '../../util/factories/follow.factory';
import { commentFactory } from '../../util/factories/comment.factory';

const bob = userFactory
  .params({ email: 'bob@bob.com', password: 'bobbobbob', username: 'bob' })
  .build();

const john = userFactory
  .params({
    email: 'john@john.com',
    password: 'johnjohnjohn',
    username: 'john',
  })
  .build();

const jack = userFactory
  .params({
    email: 'jack@jack.com',
    password: 'jackjackjack',
    username: 'jack',
  })
  .build();

const posts = [
  postFactory.params({ userId: bob.id }).buildList(10),
  postFactory.params({ userId: john.id }).buildList(10),
  postFactory.params({ userId: jack.id }).buildList(10),
];

const follows = [
  followFactory.params({ followerId: bob.id, followeeId: john.id }).build(),
  followFactory.params({ followerId: john.id, followeeId: bob.id }).build(),
  followFactory.params({ followerId: john.id, followeeId: jack.id }).build(),
  followFactory
    .params({
      followerId: jack.id,
      followeeId: bob.id,
    })
    .build(),
];

const comments = [
  commentFactory
    .params({ userId: john.id, postId: posts[0][0].id })
    .buildList(2),
  commentFactory
    .params({ userId: bob.id, postId: posts[1][0].id })
    .buildList(3),
  commentFactory
    .params({ userId: jack.id, postId: posts[1][0].id })
    .buildList(2),
  commentFactory
    .params({ userId: jack.id, postId: posts[1][1].id })
    .buildList(3),
  commentFactory
    .params({ userId: bob.id, postId: posts[2][0].id })
    .buildList(2),
];

export async function seed(knex: Knex): Promise<void> {
  await knex('users').delete();
  await knex('posts').delete();
  await knex('comments').delete();
  await knex('follows').delete();

  const users = await hashPassword([bob, john, jack]);

  await knex('users').insert(users);
  await knex('follows').insert(follows);

  await knex('posts').insert(posts.flat());

  await knex('comments').insert(comments.flat());
}

async function hashPassword(users: User[]) {
  const hashed = [];

  for (let i = 0; i < users.length; i++) {
    hashed.push({
      ...users[i],
      password: await hash(users[i].password),
    });
  }

  return hashed;
}
