import { Factory } from 'fishery';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { UserToken } from '@src/user/types/token';

export const tokenFactory = Factory.define<UserToken>(({ params }) => {
  return {
    id: v4(),
    value: faker.random.alphaNumeric(32),
    context: params.context,
    userId: params.userId,
  };
});
