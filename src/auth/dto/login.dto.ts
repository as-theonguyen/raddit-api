import { IsEmail, MinLength } from 'class-validator';

export class LoginDTO {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
