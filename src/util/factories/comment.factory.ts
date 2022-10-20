import { Factory } from 'fishery';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { Comment } from '@src/comment/types/comment';

export const commentFactory = Factory.define<Comment>(({ params }) => {
  return {
    id: v4(),
    content: faker.lorem.sentence(),
    userId: params.userId,
    postId: params.postId,
  };
});
