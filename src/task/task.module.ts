import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { KisService } from 'src/kis/kis.service';
import { KisModule } from 'src/kis/kis.module';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KisToken } from 'src/global/entities/kistoken.entity';
import { Interest } from 'src/global/entities/interest.entity';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { MessageService } from 'src/message/message.service';
import { Message } from 'src/global/entities/message.entity';

@Module({
  imports: [
    KisModule,
    HttpModule,
    TypeOrmModule.forFeature([KisToken, Interest, Message]),
  ],
  providers: [
    TaskService,
    KisService,
    UserService,
    UserRepository,
    MessageService,
  ],
})
export class TaskModule {}
