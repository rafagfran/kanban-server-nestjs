import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}

  @Post()
  async chatbot(@Body() body: { message: string }) {
    try {
      if (!body.message) {
        throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
      }

      const response = await this.chatbotService.handleMessage(body.message);
      return { success: true, data: response};
    } catch (error) {
      throw new HttpException(error.message || "Interna server error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
