import { Factory } from 'fishery';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { User } from '@src/user/types/user';

export const userFactory = Factory.define<User>(() => {
  return {
    id: v4(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
  };
});
