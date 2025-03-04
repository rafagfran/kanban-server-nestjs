import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post
} from '@nestjs/common';
import { TColumnsWithCards, TListCreate } from 'src/types/types';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './create-column.dto';

@Controller('column')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Post()
  async createColumn(@Body() createColumnDto: CreateColumnDto) {
    const { title } = createColumnDto;

    return this.columnService.createColumn({ title });
  }

  @Get()
  async allColumns(): Promise<TListCreate[]> {
    return await this.columnService.listAllColumns();
  }

  @Get("with-cards")
  async withCards(): Promise<TColumnsWithCards[]> {
    return this.columnService.listColumnsWithCards();
  }

  @Delete(':id')
  async deleteList(@Param('id', ParseIntPipe) id: number) {
    return this.columnService.deleteColumn(id);
  }
}
