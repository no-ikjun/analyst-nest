import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Interest } from './interest.entity';
import { Message } from './message.entity';
import { ForeignInterest } from './foreignInterest.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Interest, (interest) => interest.user)
  interests: Interest[];

  @OneToMany(() => ForeignInterest, (foreignInterest) => foreignInterest.user)
  foreignInterests: ForeignInterest[];

  @Column({ default: 1 })
  preference: number;

  @OneToMany(() => Message, (message) => message.user)
  message: Message[];
}
