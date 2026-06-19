import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../user/entities/user.entity';

export class RegisterDto {
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username should not be empty' })
  readonly username!: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  readonly password!: string;

  @IsEnum(UserRole, { message: 'Role must be either user or admin' })
  @IsOptional()
  readonly role?: UserRole;
}
