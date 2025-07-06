import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_uuid: string;

  @Column({ type: 'text', nullable: true })
  interests: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  risk_profile: string; // 안정형, 중립형, 공격형 등

  @Column({ type: 'varchar', length: 50, nullable: true })
  knowledge_level: string; // beginner, intermediate, advanced 등

  @CreateDateColumn()
  created_at: Date;
}
