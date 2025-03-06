import { Body, Controller, Post } from '@nestjs/common';
import OpenAI from 'openai';
import { CardService } from 'src/card/card.service';
import { ColumnService } from 'src/column/column.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private cardService: CardService,
    private columnService: ColumnService
  ) {}

  @Post()
  async chatbot(@Body() body: { message: string }) {
    const token = process.env.GITHUB_TOKEN;
    const endpoint = 'https://models.inference.ai.azure.com';

    const client = new OpenAI({ baseURL: endpoint, apiKey: token });

    const { choices } = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `
            Você é um assistente que deve responder **exclusivamente** em JSON, seguindo o formato: {"columnTitle": "columnTitle", "cards":["title": "title"]}. 
            Se sua resposta não estiver nesse formato, a ação não poderá ser executada. 
            Caso o usuário solicite algo fora do seu escopo de ações, retorne o erro e um motivo do erro. 
            Não inclua explicações adicionais, apenas retorne o JSON solicitado.`
        },
        { role: 'user', content: body.message }
      ],
      temperature: 1.0,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      top_p: 1.0,
      // biome-ignore lint/style/useNamingConvention: <explanation>
      max_tokens: 1000,
      model: 'gpt-4o'
    });

    const chatbotResponse = choices[0].message.content;

    if (!chatbotResponse) {
      return 'Erro ao processar a requisição';
    }

    const chatbotResponseParsed = JSON.parse(chatbotResponse);

    if (chatbotResponseParsed.error) {
      return chatbotResponseParsed;
    }

    if (!chatbotResponseParsed.columnTitle || !chatbotResponseParsed.cards) {
      return {
        error: 'Formato inválido',
        message: 'O JSON deve conter os campos "title" e "columnId"'
      };
    }

    const newColumn = await this.columnService.createColumn({
      title: chatbotResponseParsed.columnTitle
    });

    return await this.cardService.createCardInBulkPerColumn({
      cards: chatbotResponseParsed.cards,
      columnId: newColumn.id
    });
  }
}
