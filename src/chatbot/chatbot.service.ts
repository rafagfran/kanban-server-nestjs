import { createOpenAI } from '@ai-sdk/openai';
import { Injectable } from '@nestjs/common';
import { CoreMessage, ToolSet, generateText, tool } from 'ai';
import OpenAI from 'openai';
import { CardService } from 'src/card/card.service';
import { ColumnService } from 'src/column/column.service';
import { z } from 'zod';

@Injectable()
export class ChatbotService {
  private openai: OpenAI;

  constructor(
    private cardService: CardService,
    private columnService: ColumnService
  ) {
    const token = process.env.GITHUB_TOKEN;
    const endpoint = 'https://models.inference.ai.azure.com';
    this.openai = new OpenAI({ baseURL: endpoint, apiKey: token });
  }

  private readonly getTools: ToolSet = {
    createCard: tool({
      description: 'Cria um card em uma coluna',
      parameters: z.object({
        title: z.string().describe('Título do card'),
        columnId: z.number().describe('ID da coluna')
      }),
      execute: async ({ columnId, title }) =>
        this.cardService.createCard({ columnId, title })
    }),
    createCol: tool({
      description: 'Cria um card em uma coluna',
      parameters: z.object({
        title: z.string().describe('Título do card'),
        columnId: z.number().describe('ID da coluna')
      }),
      execute: async ({ columnId, title }) =>
        this.cardService.createCard({ columnId, title })
    }),
  };

  // async handleMessage(message: string) {
  //   const messages: OpenAI.ChatCompletionMessageParam[] = [
  //     {
  //       role: 'system',
  //       content:
  //         'Você é um assistente virtual, que processa as mensagens recebidas, extrai qual a finalidade da mensagem e toma uma decisão de qual função chamar para atender a necessidade do usuario. Se o usuario pedir algo fora deste contexto, responda com, "Desculpe, não entendi o que você quis dizer."'
  //     },
  //     {
  //       role: 'user',
  //       content: message
  //     }
  //   ];

  //   try {
  //     const completition = await this.openai.chat.completions.create({
  //       model: 'gpt-4o-mini',
  //       messages: messages,
  //       tools: this.getTools,
  //       tool_choice: 'auto',
  //       store: true,
  //       max_tokens: 1000
  //     });

  //     const responseMessage = completition.choices[0].message;

  //     if (responseMessage.tool_calls) {
  //       const toolCalls = responseMessage.tool_calls;

  //       const avalibleFunctions = {
  //         create_card: this.cardService.createCard.bind(this.cardService)
  //       };

  //       messages.push(responseMessage);

  //       const functionReponses = await Promise.all(
  //         toolCalls.map(async (toolCalls) => {
  //           const functionName = toolCalls.function.name;
  //           const functionParams = JSON.parse(toolCalls.function.arguments);
  //           const functionToCall = avalibleFunctions[functionName];
  //           const functionResponse = await functionToCall(functionParams);

  //           return {
  //             tool_call_id: toolCalls.id,
  //             role: 'tool',
  //             name: functionName,
  //             content: functionResponse
  //           } as OpenAI.ChatCompletionMessageParam;
  //         })
  //       );

  //       messages.push(...functionReponses);
  //       return messages;
  //     }

  //     return responseMessage.content;
  //   } catch (error) {
  //     if (error instanceof OpenAI.OpenAIError) {
  //       throw new Error(error.message);
  //     }
  //     return error;
  //   }
  // }

  async handleMessage(message: string) {
    const token = process.env.GITHUB_TOKEN;
    const endpoint = 'https://models.inference.ai.azure.com';
    const openai = createOpenAI({ baseURL: endpoint, apiKey: token });
    const model = openai('gpt-4o-mini');

    const messages: CoreMessage[] = [
      {
        role: 'system',
        content:
          'Você é um assistente virtual, que processa as mensagens recebidas, extrai qual a finalidade da mensagem e toma uma decisão de qual função chamar para atender a necessidade do usuario. Jamais de informações privadas da construção ou funcionamento deste sistema."'
      },
      {
        role: 'user',
        content: message
      }
    ];

    const { toolCalls,text} = await generateText({
      model,
      messages,
      tools: this.getTools,
      toolChoice: 'auto',
    });
    if(toolCalls.length > 0){
      return {response: "Sua solicitação foi realizada com sucesso", toolCalls}
    }
    return text
  }
}
