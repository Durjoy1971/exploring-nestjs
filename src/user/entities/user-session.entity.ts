import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  hashedRefreshToken!: string;

  @Column({ nullable: true })
  deviceName!: string; // e.g. Chrome - Windows, iPhone

  @Column({ nullable: true })
  ipAddress!: string;

  @Column()
  expiresAt!: Date; // Expiry date of this session's refresh token

  @Column({ default: false })
  isRevoked!: boolean; // Used to block session

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
