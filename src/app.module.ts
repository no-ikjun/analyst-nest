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

@Module({
  imports: [
    HttpModule,
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
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService, ConfigService],
})
export class AppModule {}
