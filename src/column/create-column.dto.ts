import { IsNotEmpty, IsNumber } from 'class-validator';
import { ColumnCreateInput } from 'src/types/types';

export class CreateColumnDto implements ColumnCreateInput {
  @IsNotEmpty()
  readonly title: string;

  @IsNumber()
  position?: number | null | undefined;
}
