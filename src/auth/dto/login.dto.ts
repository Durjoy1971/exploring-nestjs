import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username should not be empty' })
  readonly username!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  readonly password!: string;
}
