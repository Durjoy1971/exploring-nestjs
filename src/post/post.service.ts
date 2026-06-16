import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

export class PostItem {
  id: number;
  description: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PostService {
  // In-memory temporary storage initialized with a starter post
  private posts: PostItem[] = [
    {
      id: 1,
      description: 'Understanding NestJS Dependency Injection',
      author: 'Senior Developer',
      createdAt: new Date('2026-06-16T08:00:00.000Z'),
      updatedAt: new Date('2026-06-16T08:00:00.000Z'),
    },
  ];

  // Counter to generate unique IDs
  private idCounter = 1;

  findAll(): PostItem[] {
    return this.posts;
  }

  findOne(id: number): PostItem {
    const post = this.posts.find((p) => p.id === id);
    if (!post) {
      // NestJS provides built-in HTTP exceptions. Throwing NotFoundException
      // automatically translates to a 404 response on the HTTP layer.
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  create(createPostDto: CreatePostDto): PostItem {
    this.idCounter++;
    const newPost: PostItem = {
      id: this.idCounter,
      description: createPostDto.description,
      author: createPostDto.author,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.push(newPost);
    return newPost;
  }

  update(id: number, updatePostDto: UpdatePostDto): PostItem {
    const post = this.findOne(id); // Reuses findOne, which throws NotFoundException if missing

    // Update only the provided fields from the partial update object
    if (updatePostDto.description !== undefined) {
      post.description = updatePostDto.description;
    }
    if (updatePostDto.author !== undefined) {
      post.author = updatePostDto.author;
    }

    post.updatedAt = new Date();
    return post;
  }

  remove(id: number): PostItem {
    const postIndex = this.posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const [deletedPost] = this.posts.splice(postIndex, 1);
    return deletedPost;
  }
}
