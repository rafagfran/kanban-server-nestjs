import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post
} from '@nestjs/common';
import OpenAI from 'openai';
import { CardService } from 'src/card/card.service';
import { ColumnService } from 'src/column/column.service';
import { TCardCreate } from 'src/types/types';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly cardService: CardService,
    private  readonly columnService: ColumnService
  ) {}

  @Post()
  async chatbot(@Body() body: { message: string }) {
    const token = process.env.GITHUB_TOKEN;
    const endpoint = 'https://models.inference.ai.azure.com';

    const client = new OpenAI({ baseURL: endpoint, apiKey: token });

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: body.message
      }
    ];

    const tools: OpenAI.ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'create_card',
          description: 'Cria um novo card em uma coluna específica',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Título do card'
              },
              columnId: {
                type: 'number',
                description: 'ID da coluna onde o card será criado'
              }
            },
            required: ['title', 'columnId'],
            additionalProperties: false
          },
          strict: true
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_column',
          description: 'Cria uma nova coluna com um título específico',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Título da coluna'
              }
            },
            required: ['title'],
            additionalProperties: false
          },
          strict: true
        }
      }
    ];

    const completition = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      tools: tools,
      tool_choice: 'auto',
      // store: true,
      temperature: 1.0,
      top_p: 1.0,
      max_tokens: 1000
    });

    // Armazena a resposta do modelo
    const responseMessage = completition.choices[0].message;

    // Verifica se a resposta contém chamadas de ferramentas
    if (responseMessage.tool_calls) {
      // Armazena as chamadas de ferramentas
      const toolCalls = responseMessage.tool_calls;
      // Funções disponíveis para serem chamadas
      const avalibleFunctions = {
        create_card: this.cardService.createCard.bind(this.cardService),
        create_column:() => this.columnService.createColumn
      };

      messages.push(responseMessage);
      const functionReponses = await Promise.all(
        toolCalls.map(async (toolCalls) => {
          // Nome da função a ser chamada
          const functionName = toolCalls.function.name as keyof typeof avalibleFunctions;

          if(!functionName){
            throw new HttpException(
              `Função "${functionName}" não encontrada`,
              HttpStatus.NOT_FOUND
            );
          }

          // Parâmetros da função
          const functionParams = JSON.parse(toolCalls.function.arguments);
          // Procura a função a ser chamada
          const functionToCall = avalibleFunctions[functionName];

          if (!functionToCall) {
            throw new HttpException(
              `Função "${functionName}" não encontrada`,
              HttpStatus.NOT_FOUND
            );
          }

          
          // Chama a função
          const functionResponse = await functionToCall(functionParams);

          return {
            tool_call_id: toolCalls.id,
            role: 'tool',
            name: functionName,
            content: functionResponse
          } as OpenAI.ChatCompletionMessageParam;
        })
      );
      messages.push(...functionReponses);
      return messages;
    }
  }
}
