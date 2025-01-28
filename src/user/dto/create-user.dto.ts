import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}
