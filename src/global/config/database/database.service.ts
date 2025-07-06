import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Article } from 'src/global/entities/article.entity';
import { ForeignInterest } from 'src/global/entities/foreignInterest.entity';
import { Interest } from 'src/global/entities/interest.entity';
import { KisToken } from 'src/global/entities/kistoken.entity';
import { Message } from 'src/global/entities/message.entity';
import { Profile } from 'src/global/entities/profile.entity';
import { User } from 'src/global/entities/user.entity';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      username: this.configService.get<string>('DATABASE_USER'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      port: this.configService.get<number>('DATABASE_PORT'),
      host: this.configService.get<string>('DATABASE_HOST'),
      database: this.configService.get<string>('DATABASE_NAME'),
      timezone: '+09:00',
      entities: [
        User,
        Interest,
        KisToken,
        Message,
        ForeignInterest,
        Article,
        Profile,
      ],
      synchronize: true,
    };
  }
}
