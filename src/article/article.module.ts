import { Module } from '@nestjs/common';
import { ArticlesController } from './article.controller';
import { ArticlesService } from './article.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from 'src/global/entities/article.entity';
import { Profile } from 'src/global/entities/profile.entity';
import { ProfileService } from 'src/profile/profile.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Profile]),
    HttpModule,
    JwtModule,
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, ProfileService, JwtService],
})
export class ArticlesModule {}
