import {
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { KisService } from './kis.service';
import { KisTokenResponseType } from 'src/global/types/response.type';
import { AuthGuard } from 'src/auth/auth.guard';
import { TaskService } from 'src/task/task.service';

@Controller('kis')
export class KisController {
  constructor(
    private readonly kisService: KisService,
    private readonly taskService: TaskService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('kis-token')
  async getKisToken(): Promise<KisTokenResponseType> {
    return await this.kisService.getKisToken();
  }

  @UseGuards(AuthGuard)
  @Get('stock-info')
  async getStockInfo(@Query('code') code: string) {
    return await this.kisService.getKisStockInfo(code);
  }

  @UseGuards(AuthGuard)
  @Get('foreign/stock-info')
  async getForeignStockInfo(@Query('code') code: string) {
    return await this.kisService.getKisForeignStockInfo(code);
  }

  @UseGuards(AuthGuard)
  @Post('add-interest')
  async addInterest(@Query('code') code: string, @Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return await this.kisService.addInterest(code, accessToken);
  }

  @UseGuards(AuthGuard)
  @Post('foreign/add-interest')
  async addForeignInterest(@Query('code') code: string, @Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return await this.kisService.addForeignInterest(code, accessToken);
  }

  @UseGuards(AuthGuard)
  @Get('interest-list')
  async getInterestList(@Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return await this.kisService.getInterestList(accessToken);
  }

  @UseGuards(AuthGuard)
  @Get('foreign/interest-list')
  async getForeignInterestList(@Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return await this.kisService.getForeignInterestList(accessToken);
  }

  @UseGuards(AuthGuard)
  @Delete('delete-interest')
  async deleteInterest(@Query('code') code: string, @Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return await this.kisService.deleteInterest(code, accessToken);
  }

  @UseGuards(AuthGuard)
  @Delete('foreign/delete-interest')
  async deleteForeignInterest(@Query('code') code: string, @Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return await this.kisService.deleteForeignInterest(code, accessToken);
  }

  @UseGuards(AuthGuard)
  @Get('realtime-price')
  async getBalanceSheet(@Query('code') code: string) {
    return this.kisService.getRealTimeStockPrice(code);
  }

  @UseGuards(AuthGuard)
  @Get('realtime-price')
  async sendRealtimePriceMessage() {
    return this.taskService.sendRealTimeStockPrice();
  }

  @UseGuards(AuthGuard)
  @Get('foreign/realtime-price')
  async sendRealtimeForeignPriceMessage() {
    return this.taskService.sendRealTimeForeignStockPrice();
  }
}
