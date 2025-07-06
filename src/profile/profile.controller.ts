import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtService } from '@nestjs/jwt';

@Controller('profiles')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  async getProfile(@Query('access_token') accessToken: string) {
    const userUuid = this.jwtService.decode(accessToken)?.id;
    if (!userUuid) {
      return { message: '유효하지 않은 토큰입니다.' };
    }
    return this.profileService.findByUserUuid(userUuid);
  }

  @Post()
  async saveProfile(
    @Query('access_token') accessToken: string,
    @Body() body: any,
  ) {
    const userUuid = this.jwtService.decode(accessToken)?.id;
    if (!userUuid) {
      return { message: '유효하지 않은 토큰입니다.' };
    }
    return this.profileService.createOrUpdate(userUuid, body);
  }
}
