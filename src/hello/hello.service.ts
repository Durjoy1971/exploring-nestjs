import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
    getHello(): string {
        return 'Hello World!';
    }

    getHelloWithName(name: string): string {
        return `Hello, ${name}!`;
    }

}
