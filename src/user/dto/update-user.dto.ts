import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDTO {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @IsNotEmpty()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsNotEmpty()
  @MinLength(8)
  currentPassword: string;
}
