import { IsNotEmpty } from 'class-validator';
import { ColumnCreateInput } from 'src/types/types';

export class CreateColumnDto implements ColumnCreateInput {
  @IsNotEmpty()
  readonly title: string;
}
