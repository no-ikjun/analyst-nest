import { Module } from '@nestjs/common';
import { GptService } from './gpt.service';
import { GptController } from './gpt.controller';
import { TaskService } from 'src/task/task.service';
import { KisService } from 'src/kis/kis.service';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KisToken } from 'src/global/entities/kistoken.entity';
import { Interest } from 'src/global/entities/interest.entity';
import { Message } from 'src/global/entities/message.entity';
import { ForeignInterest } from 'src/global/entities/foreignInterest.entity';
import { HttpModule } from '@nestjs/axios';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([KisToken, Interest, Message, ForeignInterest]),
  ],
  providers: [
    GptService,
    TaskService,
    KisService,
    MessageService,
    UserService,
    UserRepository,
  ],
  controllers: [GptController],
})
export class GptModule {}
