import { Controller, Get, Param, Query } from '@nestjs/common';
import { HelloService } from './hello.service';

@Controller('hello')
export class HelloController {
  // Dependency injection (DI)
  // [INJECTING] an instance of HelloService into this class
  constructor(private readonly helloService: HelloService) {}

  // [ROUTING] this method is executed when a GET request is made to /hello
  @Get()
  getHello(): string {
    // [DELEGATION] passing the request/logic to the service
    return this.helloService.getHello();
  }

  @Get('user/:name')
  getHelloWithName(@Param('name') name: string) {
    return this.helloService.getHelloWithName(name);
  }

  @Get('query')
  getHelloWithQuery(@Query('name') name: string) {
    return this.helloService.getHelloWithName(name);
  }
}
