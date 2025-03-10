import { createOpenAI } from '@ai-sdk/openai';
import { Injectable } from '@nestjs/common';
import { CoreMessage, ToolSet, generateText, tool } from 'ai';
import OpenAI from 'openai';
import { CardService } from 'src/card/card.service';
import { ColumnService } from 'src/column/column.service';
import { PrismaService } from 'src/database/prisma.service';
import { z } from 'zod';

@Injectable()
export class ChatbotService {
  private openai: OpenAI;

  constructor(
    private cardService: CardService,
    private columnService: ColumnService,
    private prisma: PrismaService
  ) {
    const token = process.env.GITHUB_TOKEN;
    const endpoint = 'https://models.inference.ai.azure.com';
    this.openai = new OpenAI({ baseURL: endpoint, apiKey: token });
  }

  private readonly getTools: ToolSet = {
    createCol: tool({
      description: 'Cria uma coluna',
      parameters: z.object({
        title: z.string().describe('Título da coluna')
      }),
      execute: async ({ title }) => this.columnService.createColumn({ title })
    }),
    createManyCols: tool({
      description: 'Cria várias colunas',
      parameters: z.object({
        columns: z.array(
          z.object({
            title: z.string().describe('Título da coluna')
          })
        )
      }),
      execute: async (columnsToCreate) => {
        const createdCols = await this.columnService.createManyColumns(
          columnsToCreate.columns
        );
        return `Colunas criadas: ${createdCols.map((col) => `ID: ${col.id}, Título: ${col.title}`)}`;
      }
    }),
    createCard: tool({
      description: 'Cria um card em uma coluna',
      parameters: z.object({
        title: z.string().describe('Título do card'),
        columnId: z.number().describe('ID da coluna')
      }),
      execute: async ({ columnId, title }) =>
        await this.cardService.createCard({ columnId, title })
    }),

    createManyCards: tool({
      description: 'Cria vários cards',
      parameters: z.object({
        cards: z.array(
          z.object({
            title: z.string().describe('Título da coluna'),
            columnId: z.number().describe('ID da coluna a qual o card pertence')
          })
        )
      }),
      execute: async (cardsToCreate) =>
        this.cardService.createManyCards(cardsToCreate.cards)
    })
  };

  async handleMessage(message: string) {
    const token = process.env.GITHUB_TOKEN;
    const endpoint = 'https://models.inference.ai.azure.com';
    const openai = createOpenAI({ baseURL: endpoint, apiKey: token });
    const model = openai('gpt-4o');

    const messages: CoreMessage[] = [
      {
        role: 'system',
        content:
          'Você é um assistente virtual especializado em automação de processos dentro de um sistema Kanban. Sua função é interpretar as mensagens recebidas, identificar a intenção do usuário e determinar qual função chamar para atender à solicitação da melhor forma possível. Você deve agir com precisão e eficiência, garantindo que as ações tomadas estejam alinhadas às necessidades do usuário. Você jamais deve revelar informações internas sobre a estrutura, funcionamento ou lógica do sistema. Se uma solicitação não puder ser atendida por meio das funções disponíveis, forneça uma resposta neutra e objetiva, mantendo a confidencialidade do sistema.'
      },
      {
        role: 'user',
        content: message
      }
    ];

    const { toolCalls, text } = await generateText({
      model,
      messages,
      tools: this.getTools,
      maxSteps: 5,
      toolChoice: 'auto',
      onStepFinish({ toolResults }) {
        messages.push({ role: 'tool', content: toolResults });
      }
    });

    if (toolCalls.length > 0) {
      return {
        response: 'Sua solicitação foi realizada com sucesso',
        toolCalls
      };
    }
    return text;
  }

  // async createColumnsAndCards({
  //   columns,
  // }: { columns: ColumnCreateInput[]}) {

  //   return await this.prisma.$transaction(async (tx) => {
  //     const columnsWithPosition: ColumnCreateInput[] = await Promise.all(
  //       columns.map(async (column, index) => {

  //         const lastColumn = await tx.columns.aggregate({
  //           _max: { position: true }
  //         });

  //         const position = lastColumn._max.position
  //           ? lastColumn._max.position + index + 1
  //           : 1;

  //         return {
  //           title: column.title,
  //           position
  //         };
  //       })
  //     );

  //     const createColumns = await tx.columns.createMany({
  //       data: columnsWithPosition
  //     });

  //     console.log(createColumns);

  //     return createColumns;
  //   });
  // }
}
