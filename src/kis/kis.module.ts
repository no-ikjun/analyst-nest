import { Module } from '@nestjs/common';
import { KisController } from './kis.controller';
import { KisService } from './kis.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KisToken } from 'src/global/entities/kistoken.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([KisToken])],
  controllers: [KisController],
  providers: [KisService],
})
export class KisModule {}
