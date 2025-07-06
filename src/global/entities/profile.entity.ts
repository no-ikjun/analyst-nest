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
  risk_profile: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  knowledge_level: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  asset_size: string;

  @CreateDateColumn()
  created_at: Date;
}
