import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { HelloService } from '../hello/hello.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly helloService: HelloService,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
    });
  }

  async findByUsernameWithPassword(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
      },
    });
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateData: Partial<User>): Promise<void> {
    await this.userRepository.update(id, updateData);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUserbyId(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async getWelcomeMessageWithId(userId: number): Promise<string> {
    const user = await this.getUserbyId(userId);
    return this.helloService.getHelloWithName(user.username);
  }
}
