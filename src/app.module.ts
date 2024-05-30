import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GptModule } from './gpt/gpt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './global/config/database/database.module';
import { DatabaseService } from './global/config/database/database.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { KisModule } from './kis/kis.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskModule } from './task/task.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000 * 100,
      maxRedirects: 5,
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [DatabaseModule],
      useClass: DatabaseService,
      inject: [DatabaseService],
    }),
    DatabaseModule,
    GptModule,
    AuthModule,
    UserModule,
    KisModule,
    ScheduleModule,
    TaskModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService, ConfigService],
})
export class AppModule {}
