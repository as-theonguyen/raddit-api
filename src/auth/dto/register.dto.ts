import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  username: string;

  @MinLength(8)
  password: string;
}
