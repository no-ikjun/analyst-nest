import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('stock')
  async fetchApiData(@Query('query') query: string) {
    return this.appService.fetchApiData(query);
  }
}
