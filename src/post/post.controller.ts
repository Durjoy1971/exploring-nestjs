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
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsFilterDto } from './dto/get-posts-filter.dto';
import { Post } from './entities/post.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filterDto: GetPostsFilterDto): Promise<{ data: Post[]; meta: any }> {
    return await this.postService.findAll(filterDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Post> {
    return await this.postService.findOne(id);
  }

  @HttpPost()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPostDto: CreatePostDto,
    @GetUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }), // 1 MB limit
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ): Promise<Post> {
    return await this.postService.create(createPostDto, user, file);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }), // 1 MB limit
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ): Promise<Post> {
    return await this.postService.update(id, updatePostDto, user, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    await this.postService.remove(id, user);
  }
}
