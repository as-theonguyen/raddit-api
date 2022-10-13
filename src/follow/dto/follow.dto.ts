import { IsUUID } from 'class-validator';

export class FollowDTO {
  @IsUUID()
  followerId: string;

  @IsUUID()
  followeeId: string;
}
