import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put
} from '@nestjs/common';
import type { TCard } from 'src/types/types';
import { CardService } from './card.service';
import { CreateCardDto } from './create-card.dto';
import { UpdateCardDto } from './update-card.dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  async createCard(@Body() createCardDto: CreateCardDto) {
    return this.cardService.createCard(createCardDto);
  }

  @Get(':id')
  async listCardsByColumn(@Param('id') id: string): Promise<TCard[]> {
    return this.cardService.getCardsByColumn(+id);
  }

  @Get()
  async listAllCards(): Promise<TCard[]> {
    return this.cardService.getAllCards();
  }

  @Put(':id')
  async updateCardTitle(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCardDto: UpdateCardDto
  ) {

    return this.cardService.updateCardTitle(id, updateCardDto);
  }

  @Delete(':id')
  async deleteCard(@Param('id', ParseIntPipe) id: number) {
    return this.cardService.deleteCard(id);
  }
}
