import { Module } from '@nestjs/common';
import { KisController } from './kis.controller';
import { KisService } from './kis.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KisToken } from 'src/global/entities/kistoken.entity';
import { Interest } from 'src/global/entities/interest.entity';
import { ForeignInterest } from 'src/global/entities/foreignInterest.entity';
import { TaskService } from 'src/task/task.service';
import { UserService } from 'src/user/user.service';
import { MessageService } from 'src/message/message.service';
import { GptService } from 'src/gpt/gpt.service';
import { UserRepository } from 'src/user/user.repository';
import { Message } from 'src/global/entities/message.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([KisToken, Interest, ForeignInterest, Message]),
  ],
  controllers: [KisController],
  providers: [
    KisService,
    TaskService,
    UserService,
    MessageService,
    GptService,
    UserRepository,
  ],
})
export class KisModule {}
