import { IsString } from 'class-validator';

export class UpdateListDto {
  @IsString()
  readonly title: string;
}
