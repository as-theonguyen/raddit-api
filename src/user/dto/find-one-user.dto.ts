import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class FindOneDTO {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNotEmpty()
  @IsOptional()
  username?: string;
}
