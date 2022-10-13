import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteCommentDTO {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
