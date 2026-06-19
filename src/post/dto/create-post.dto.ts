import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description should not be empty' })
  readonly description!: string;

  @IsString({ message: 'Author must be a string' })
  @IsNotEmpty({ message: 'Author should not be empty' })
  readonly author!: string;
}
