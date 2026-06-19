import { IsOptional, IsInt, Min, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPostsFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string; // Search within description or author username
}
