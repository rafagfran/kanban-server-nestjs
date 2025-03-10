import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post
} from '@nestjs/common';
import { ColumnResponse, ColumnWithCardsResponse } from 'src/types/types';
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
  async allColumns(): Promise<ColumnResponse[]> {
    return await this.columnService.listAllColumns();
  }

  @Get('with-cards')
  async withCards(): Promise<ColumnWithCardsResponse[]> {
    return this.columnService.listColumnsWithCards();
  }

  @Delete(':id')
  async deleteList(@Param('id', ParseIntPipe) id: number) {
    return this.columnService.deleteColumn(id);
  }
}
