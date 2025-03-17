import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { CardCreateInput, CardPriority } from 'src/types/types';
export class CreateCardDto implements CardCreateInput {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  columnId: number;

  @IsEnum(CardPriority)
  priority?: string;
}
