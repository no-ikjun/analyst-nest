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

  @UseGuards(AuthGuard)
  @Post('add-interest')
  async addInterest(@Query('code') code: string, @Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return this.kisService.addInterest(code, accessToken);
  }

  @UseGuards(AuthGuard)
  @Get('interest-list')
  async getInterestList(@Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return this.kisService.getInterestList(accessToken);
  }

  @UseGuards(AuthGuard)
  @Delete('delete-interest')
  async deleteInterest(@Query('code') code: string, @Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return this.kisService.deleteInterest(code, accessToken);
  }
}
