import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ArticlesService } from './article.service';
import { HttpService } from '@nestjs/axios';
import { ProfileService } from 'src/profile/profile.service';
import { JwtService } from '@nestjs/jwt';

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly profileService: ProfileService,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  create(@Body() body) {
    return this.articlesService.create(body);
  }

  @Get('recommend')
  async recommend(@Query('access_token') accessToken: string) {
    const userUuid = await this.jwtService.decode(accessToken).id;
    const profile = await this.profileService.findByUserUuid(userUuid);

    if (!profile) {
      return { message: '해당 유저의 투자 프로필이 존재하지 않습니다.' };
    }

    const response = await this.httpService.axiosRef.post(
      'https://wisemind-ai.ikjun.com/recommend/articles',
      {
        interests: profile.interests,
        riskProfile: profile.risk_profile,
        knowledgeLevel: profile.knowledge_level,
        limit: 15,
      },
    );
    console.log('Recommendation response:', response.data);

    return response.data;
  }
}
