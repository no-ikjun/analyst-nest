import { Body, Controller, Post } from '@nestjs/common';
import { ArticlesService } from './article.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(@Body() body) {
    return this.articlesService.create(body);
  }
}
