import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {

  constructor(private configService: ConfigService) { }
  getHello(): string {
    return 'Hello World!';
  }

  getDbHost(): string {
    // 1. Get with type parameter (returns string | undefined)
    const dbHost = this.configService.get<string>('DATABASE_HOST');
    // 2. Get with a fallback default value
    const port = this.configService.get<number>('PORT', 3000);
    // 3. Throw an error if the key is missing (NestJS 9+)
    const dbUser = this.configService.getOrThrow<string>('DATABASE_USER');
    return `Connecting to host: ${dbHost}`;
  }
}
