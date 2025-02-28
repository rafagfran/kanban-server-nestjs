import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { TListCreate } from 'src/types/types';

@Injectable()
export class ListService {
  constructor(private prisma: PrismaService) {}

  async createList(data: TListCreate) {
    return this.prisma.columns.create({ data });
  }

  async getAllLists() {
    return await this.prisma.columns.findMany();
  }
}
