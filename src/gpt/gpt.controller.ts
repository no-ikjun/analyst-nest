import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { GptService } from './gpt.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { GptDto } from './dto/gpt.dto';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @UseGuards(AuthGuard)
  @Get()
  async testGpt(@Body() data: GptDto) {
    return this.gptService.testGpt(data.text);
  }
}
