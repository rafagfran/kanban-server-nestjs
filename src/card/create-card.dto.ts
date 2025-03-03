import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty()
  readonly title: string;

  @IsNotEmpty()
  @IsNumber()
  readonly columnId: number;
}
