import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description should not be empty' })
  @IsOptional()
  readonly description?: string;

  @IsString({ message: 'Author must be a string' })
  @IsNotEmpty({ message: 'Author should not be empty' })
  @IsOptional()
  readonly author?: string;
}
