import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description should not be empty' })
  readonly description!: string;
}
