import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    getAllUsers() {
        return this.userService.getAllUsers();
    }

    @Get(':id')
    getUserById(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getUserbyId(id);
    }

    @Get(':id/welcome')
    getWelcomeMessage(@Param('id', ParseIntPipe) id: number): string | {id: number, name: string, age: number} | string {
        return this.userService.getWelcomeMessageWithId(id);
    }
}
