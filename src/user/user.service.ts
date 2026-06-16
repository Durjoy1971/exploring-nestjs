import { Injectable } from '@nestjs/common';
import { HelloService } from '../hello/hello.service';

@Injectable()
export class UserService {
  constructor(private readonly helloService: HelloService) {}

  getAllUsers(): { id: number; name: string; age: number }[] {
    return [
      {
        id: 1,
        name: 'John Doe',
        age: 30,
      },
      {
        id: 2,
        name: 'Jane Doe',
        age: 25,
      },
      {
        id: 3,
        name: 'Bob Smith',
        age: 35,
      },
    ];
  }

  getUserbyId(id: number): { id: number; name: string; age: number } | string {
    const user = this.getAllUsers().find((user) => user.id === id);
    if (user) {
      return user;
    }
    return 'User not found';
  }

  getWelcomeMessageWithId(userId: number): string {
    const user = this.getUserbyId(userId);
    if (typeof user === 'string') {
      return user;
    }
    return this.helloService.getHelloWithName(user.name);
  }
}
