import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { HelloModule } from '../hello/hello.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession]), HelloModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
