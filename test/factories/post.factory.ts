import { v4 } from 'uuid';
import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { Post } from '@src/post/types/post';

export const postFactory = Factory.define<Post>(({ params }) => {
  return {
    id: v4(),
    title: faker.lorem.words(),
    content: faker.lorem.paragraph(),
    userId: params.userId,
  };
});
