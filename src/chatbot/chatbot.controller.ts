import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { ChatbotService } from './chatbot.service';
@Controller('chatbot')
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}

  @Post()
  async chatbot(@Body() body: { message: string }, @Res() res: Response) {
    try {
      if (!body.message) {
        throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
      }
      return this.chatbotService.handleMessage(body.message, res);
    } catch (error) {
      throw new HttpException(
        error.message || 'Interna server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
