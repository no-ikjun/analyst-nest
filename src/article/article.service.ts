import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/global/entities/article.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
  ) {}

  async create(data: {
    topic: string;
    difficulty: string;
    article: string;
    vector: number[];
    sources: string[];
  }) {
    const record = this.articlesRepository.create({
      topic: data.topic,
      difficulty: data.difficulty,
      article: data.article,
      vector: JSON.stringify(data.vector),
      sources: JSON.stringify(data.sources),
    });
    return this.articlesRepository.save(record);
  }
}
