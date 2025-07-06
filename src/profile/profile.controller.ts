import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':user_uuid')
  async getProfile(@Param('user_uuid') user_uuid: string) {
    return this.profileService.findByUserUuid(user_uuid);
  }

  @Post(':user_uuid')
  async saveProfile(@Param('user_uuid') user_uuid: string, @Body() body) {
    return this.profileService.createOrUpdate(user_uuid, body);
  }
}
