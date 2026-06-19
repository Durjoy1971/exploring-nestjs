import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  description!: string;

  @Column({ nullable: true })
  fileUrl?: string;

  @Column({ nullable: true })
  filePublicId?: string;

  @Column({ nullable: true })
  fileResourceType?: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  authorName!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
