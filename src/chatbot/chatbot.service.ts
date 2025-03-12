import { createOpenAI } from '@ai-sdk/openai';
import { Injectable } from '@nestjs/common';
import { CoreMessage, ToolSet, generateText, tool } from 'ai';
import { CardService } from 'src/card/card.service';
import { ColumnService } from 'src/column/column.service';
import { PrismaService } from 'src/database/prisma.service';
import { z } from 'zod';

@Injectable()
export class ChatbotService {
  constructor(
    private cardService: CardService,
    private columnService: ColumnService,
    private prisma: PrismaService
  ) {}

  async handleMessage(message: string) {
    const token = process.env.GITHUB_TOKEN;
    const endpoint = 'https://models.inference.ai.azure.com';
    const openai = createOpenAI({ baseURL: endpoint, apiKey: token });
    const model = openai('gpt-4o-mini');

    const getTools: ToolSet = {
      //TODO: Para criar UMA coluna e UM card, esta rodando 3 steps criar um card na coluna 1 e depois outro card na coluna correta que acabou de ser criada e somente se a coluna criada tiver um titulo que nenhma outra tem
      createCol: tool({
        description: 'Create a new column',
        parameters: z.object({
          title: z.string().describe('Column title')
        }),
        execute: async ({ title }) => this.columnService.createColumn({ title })
      }),
      createManyCols: tool({
        description: 'Create multiple columns',
        parameters: z.object({
          columns: z.array(
            z.object({
              title: z.string().describe('Column title')
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
        description: 'Create a new card',
        parameters: z.object({
          title: z.string().describe('Card title'),
          columnId: z
            .number()
            .describe('ID of the column to which the card belongs')
        }),
        execute: async ({ columnId, title }) =>
          await this.cardService.createCard({ columnId, title })
      }),

      createManyCards: tool({
        description: 'Create multiple cards',
        parameters: z.object({
          cards: z.array(
            z.object({
              title: z.string().describe('Column Title'),
              columnId: z
                .number()
                .describe('ID of the column to which the card belongs')
            })
          )
        }),
        execute: async (cardsToCreate) =>
          this.cardService.createManyCards(cardsToCreate.cards)
      })
    };

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

    try {
      const { text, steps } = await generateText({
        model,
        messages,
        tools: getTools,
        maxSteps: 5,
        toolChoice: 'auto',
        onStepFinish({ toolCalls, toolResults }) {
          if (toolResults) {

            console.log(toolResults);
          }
        }
      });

      const toolCalls = steps.some(
        (step) => step.finishReason === 'tool-calls'
      );

      return { toolCalls, message: text };
    } catch (error) {
      console.error(error);
      return 'Desculpe, não consegui entender sua solicitação. Por favor, tente novamente.';
    }
  }
}
