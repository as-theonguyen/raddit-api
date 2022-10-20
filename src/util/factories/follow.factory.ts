import { Factory } from 'fishery';
import { v4 } from 'uuid';
import { Follow } from '@src/follow/types/follow';

export const followFactory = Factory.define<Follow>(({ params }) => {
  return {
    id: v4(),
    followerId: params.followerId,
    followeeId: params.followeeId,
  };
});
