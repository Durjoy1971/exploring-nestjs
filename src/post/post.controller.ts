import {
  Controller,
  Get,
  Post as HttpPost,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Post[]> {
    return await this.postService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Post> {
    return await this.postService.findOne(id);
  }

  @HttpPost()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto): Promise<Post> {
    return await this.postService.create(createPostDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    return await this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.postService.remove(id);
  }
}
