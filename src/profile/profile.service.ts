import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/global/entities/profile.entity';
import { Repository } from 'typeorm';
@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  async findByUserUuid(user_uuid: string) {
    let profile = await this.profileRepository.findOne({
      where: { user_uuid },
    });

    if (!profile) {
      profile = this.profileRepository.create({
        user_uuid,
        interests: '주식, 부동산',
        risk_profile: '중립형',
        knowledge_level: 'beginner',
      });

      profile = await this.profileRepository.save(profile);
      console.log(`✅ 신규 프로필 생성 완료 for ${user_uuid}`);
    }

    return profile;
  }

  async createOrUpdate(user_uuid: string, data: Partial<Profile>) {
    let profile = await this.profileRepository.findOne({
      where: { user_uuid },
    });
    if (profile) {
      Object.assign(profile, data);
    } else {
      profile = this.profileRepository.create({ user_uuid, ...data });
    }
    return this.profileRepository.save(profile);
  }
}
