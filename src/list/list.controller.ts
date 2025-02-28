import { Body, Controller, Get, Post } from '@nestjs/common';
import type { TListCreate } from 'src/types/types';
import { ListService } from './list.service';

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  async createList(@Body() listInfos: TListCreate) {
    const { title, position } = listInfos;

    return this.listService.createList({ position, title });
  }

  @Get()
  async getAllLists(): Promise<TListCreate[]> {
    return this.listService.getAllLists();
  }
}
