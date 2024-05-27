import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { KisService } from './kis.service';
import { KisTokenResponseType } from 'src/global/types/response.type';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('kis')
export class KisController {
  constructor(private readonly kisService: KisService) {}

  @UseGuards(AuthGuard)
  @Get('kis-token')
  async getKisToken(): Promise<KisTokenResponseType> {
    return this.kisService.getKisToken();
  }

  @UseGuards(AuthGuard)
  @Get('stock-info')
  async getStockInfo(@Query('code') code: string) {
    return this.kisService.getKisStockInfo(code);
  }
}
