import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put
} from '@nestjs/common';
import type { CardResponse } from 'src/types/types';
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

  @Post('bulk')
  async createCardsInBulk(@Body() createCardDto: CreateCardDto[]) {
    return this.cardService.createManyCards(createCardDto);
  }

  @Post('bulk-per-column')
  async createCardsInBulkPerColumn(
    @Body() columnId: number,
    cards: { title: string }[]
  ) {
    return this.cardService.createCardInBulkPerColumn({ cards, columnId });
  }

  @Get('by-column/:id')
  async listCardsByColumn(
    @Param('id') columnId: string
  ): Promise<CardResponse[]> {
    return this.cardService.getCardsByColumn(+columnId);
  }

  @Get()
  async listAllCards(): Promise<CardResponse[]> {
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
