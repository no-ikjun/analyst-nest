import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { TaskService } from 'src/task/task.service';

@Controller('gpt')
export class GptController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(AuthGuard)
  @Get()
  async testGpt() {
    return this.taskService.generateReport();
  }

  @UseGuards(AuthGuard)
  @Get('test')
  async test() {
    return this.taskService.generateSingleStockReport();
  }
}
