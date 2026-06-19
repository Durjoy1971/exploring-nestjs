import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsFilterDto } from './dto/get-posts-filter.dto';
import { Post } from './entities/post.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PostDeletedEvent } from './events/post-deleted.event';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly cloudinaryService: CloudinaryService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(filterDto: GetPostsFilterDto): Promise<{ data: Post[]; meta: any }> {
    const { page = 1, limit = 10, search } = filterDto;
    const skip = (page - 1) * limit;

    // Create a unique cache key based on filtering/pagination options
    const searchKey = search ? encodeURIComponent(search) : 'all';
    const cacheKey = `posts:page=${page}:limit=${limit}:search=${searchKey}`;

    // Check if result is cached
    const cachedResult = await this.cacheManager.get<{ data: Post[]; meta: any }>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Query builder for filtering
    const query = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.authorName', 'author');

    if (search) {
      query.andWhere(
        '(post.description ILIKE :search OR author.username ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply pagination
    query.skip(skip).take(limit);

    const [posts, total] = await query.getManyAndCount();

    const result = {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };

    // Cache the result (ttl in ms: 10 seconds)
    await this.cacheManager.set(cacheKey, result, 10000);

    return result;
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { authorName: true },
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async create(createPostDto: CreatePostDto, user: User, file?: Express.Multer.File): Promise<Post> {
    let fileDetails = {};
    if (file) {
      const uploadRes = await this.cloudinaryService.uploadFile(file);
      fileDetails = {
        fileUrl: uploadRes.secure_url,
        filePublicId: uploadRes.public_id,
        fileResourceType: uploadRes.resource_type,
      };
    }

    const newPost = this.postRepository.create({
      ...createPostDto,
      ...fileDetails,
      authorName: user,
    });
    const savedPost = await this.postRepository.save(newPost);
    await this.clearCache();
    return savedPost;
  }

  async update(id: number, updatePostDto: UpdatePostDto, user: User, file?: Express.Multer.File): Promise<Post> {
    const post = await this.findOne(id);
    
    // Check if the user is the author or an admin
    if (post.authorName.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to update this post');
    }

    if (file) {
      // 1. Upload the new file (synchronously, since client needs the new URL)
      const uploadRes = await this.cloudinaryService.uploadFile(file);
      
      // 2. Remember old file keys
      const oldPublicId = post.filePublicId;
      const oldResourceType = post.fileResourceType;

      // 3. Assign new file info
      post.fileUrl = uploadRes.secure_url;
      post.filePublicId = uploadRes.public_id;
      post.fileResourceType = uploadRes.resource_type;

      // 4. Emit deletion event asynchronously for the old file if it existed
      if (oldPublicId && oldResourceType) {
        this.eventEmitter.emit(
          'post.deleted',
          new PostDeletedEvent(oldPublicId, oldResourceType),
        );
      }
    }

    this.postRepository.merge(post, updatePostDto);
    const updatedPost = await this.postRepository.save(post);
    await this.clearCache();
    return updatedPost;
  }

  async remove(id: number, user: User): Promise<Post> {
    const post = await this.findOne(id);

    // Check if the user is the author or an admin
    if (post.authorName.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this post');
    }

    // Emit event asynchronously to trigger Cloudinary file deletion in the background
    if (post.filePublicId && post.fileResourceType) {
      this.eventEmitter.emit(
        'post.deleted',
        new PostDeletedEvent(post.filePublicId, post.fileResourceType),
      );
    }

    const removedPost = await this.postRepository.remove(post);
    await this.clearCache();
    return removedPost;
  }

  private async clearCache(): Promise<void> {
    // Clear all in-memory caches on mutations to avoid serving stale list data
    await this.cacheManager.clear();
  }
}
