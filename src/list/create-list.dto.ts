import { IsNotEmpty } from 'class-validator';

export class CreateListDto {
  @IsNotEmpty()
  readonly title: string;
}
