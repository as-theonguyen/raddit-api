import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdatePostDTO {
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsNotEmpty()
  @IsOptional()
  content?: string;
}
