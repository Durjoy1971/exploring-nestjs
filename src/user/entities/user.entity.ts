import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { UserSession } from './user-session.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ select: false }) // Security measure: exclude password from SELECT queries by default
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @OneToMany(() => UserSession, (session) => session.user)
  sessions!: UserSession[];

  @OneToMany(() => Post, (post) => post.authorName)
  posts!: Post[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
