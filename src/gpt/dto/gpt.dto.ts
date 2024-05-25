import { IsString } from 'class-validator';

export class GptDto {
  @IsString()
  text: string;
}
