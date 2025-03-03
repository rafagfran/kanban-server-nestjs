import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post
} from '@nestjs/common';
import type { TListCreate } from 'src/types/types';
import { CreateListDto } from './create-list.dto';
import { ListService } from './list.service';

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  async createList(@Body() createListDto: CreateListDto) {
    const { title } = createListDto;

    return this.listService.createList({ title });
  }

  @Get()
  async getAllLists(): Promise<TListCreate[]> {
    return this.listService.getAllLists();
  }

  @Delete(':id')
  async deleteList(@Param('id', ParseIntPipe) id: number) {
    return this.listService.deleteList(id); 
  }
}
