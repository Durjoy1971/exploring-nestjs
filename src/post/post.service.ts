import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(): Promise<Post[]> {
    return await this.postRepository.find();
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const newPost = this.postRepository.create(createPostDto);
    return await this.postRepository.save(newPost);
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    this.postRepository.merge(post, updatePostDto);
    return await this.postRepository.save(post);
  }

  async remove(id: number): Promise<Post> {
    const post = await this.findOne(id);
    return await this.postRepository.remove(post);
  }
}
