import { Controller, Get, UseGuards } from '@nestjs/common';
import { GptService } from './gpt.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @UseGuards(AuthGuard)
  @Get()
  async testGpt() {
    return this.gptService.testGpt();
  }
}
