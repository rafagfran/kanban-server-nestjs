import { IsNotEmpty, IsNumber } from 'class-validator';
import { CardCreateInput } from 'src/types/types';

export class CreateCardDto implements CardCreateInput {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  columnId: number;
}
