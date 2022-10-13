import { User } from '@src/user/types/user';

export {};

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
