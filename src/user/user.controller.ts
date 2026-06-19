import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.getUserbyId(id);
  }

  @Get(':id/welcome')
  async getWelcomeMessage(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<string> {
    return await this.userService.getWelcomeMessageWithId(id);
  }
}
