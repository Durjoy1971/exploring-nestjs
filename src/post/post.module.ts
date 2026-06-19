import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post } from './entities/post.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PostCleanupListener } from './listeners/post-cleanup.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), CloudinaryModule],
  controllers: [PostController],
  providers: [PostService, PostCleanupListener],
})
export class PostModule {}
