import { createOpenAI } from '@ai-sdk/openai';
import { Injectable } from '@nestjs/common';
import {
  CoreMessage,
  ToolExecutionError,
  ToolSet,
  generateText,
  tool
} from 'ai';
import { timestamp } from 'rxjs';
import { CardService } from 'src/card/card.service';
import { ColumnService } from 'src/column/column.service';
import { PrismaService } from 'src/database/prisma.service';
import { z } from 'zod';

// Crie um template completo para um ambiente de trabalho, com todas as etapas para a documentação, criação e organização durante o desenvolvimento de sistemas web 

@Injectable()
export class ChatbotService {
  private openai;
  private model;
  private tools: ToolSet;
  private messages: CoreMessage[];

  constructor(
    private cardService: CardService,
    private columnService: ColumnService,
    private prisma: PrismaService
  ) {
    this.initializeOpenAI();
    this.initializeMessages();
    this.getTools();
  }

  private initializeOpenAI() {
    const token = process.env.GITHUB_TOKEN;
    const endpoint = 'https://models.inference.ai.azure.com';

    this.openai = createOpenAI({ baseURL: endpoint, apiKey: token });
    this.model = this.openai('gpt-4o-mini');
  }

  private initializeMessages() {
    this.messages = [
      {
        role: 'system',
        content:
          'Voce é um assistente virtual de automação que executa funções de acordo com a solicitação do usuario. Caso o usuario solicitar a criação de multiplas colunas e cards, sempre execute primeiro a função de criar colunas, espera a conclusão e somente depois execute a de criação de cards, jamais execute as duas funçoes ao mesmo tempo, isto causara erro, pois os cards dependes das colunas. Ao criar vários cartões, sempre agrupe-os em uma única operação em lote, independentemente das colunas atribuídas.Se uma solicitação não for clara, puder comprometer a integridade do sistema ou violar as regras de dependência (por exemplo, criar cartões antes das colunas), peça esclarecimentos antes de prosseguir e Nunca divulgue detalhes internos sobre a lógica, estrutura ou funcionalidade do sistema. Nao precisa falar quais os passos que vai ou esta executando, apenas execute. Caso o usuario peça um modelo crie um modelo que atenda as necessidades dele e pergunte se ele deseja que seja criado. Sempre que o usuario solicitar uma deleção, faça uma verificação de segurança'
      }
    ];
  }
  private getTools() {
    this.tools = {
      createCol: tool({
        description: 'Create a new column',
        parameters: z.object({
          title: z.string().describe('Column title')
        }),
        execute: async ({ title }) =>
          await this.columnService.createColumn({ title })
      }),
      createMultipleCols: tool({
        description: 'Create multiple columns and return the coluns data',
        parameters: z.object({
          columns: z.array(
            z.object({
              title: z.string().describe('Column title')
            })
          )
        }),
        execute: async ({ columns }) =>
          await this.columnService.createManyColumns(columns)
      }),
      createCard: tool({
        description: 'Create a new card',
        parameters: z.object({
          title: z.string().describe('Card title'),
          columnId: z
            .number()
            .describe('ID of the column to which the card belongs')
        }),
        execute: async ({ columnId, title }) => {
          await this.cardService.createCard({ columnId, title });
        }
      }),
      createMultipleCards: tool({
        description: 'Create multiple cards',
        parameters: z.object({
          cards: z.array(
            z.object({
              title: z.string().describe('title of card'),
              columnId: z.number().describe('Number of column')
            })
          )
        }),
        execute: async ({ cards }) => {
          if (!Array.isArray(cards)) {
            return 'Cards nao estao no formato correto';
          }
          return await this.cardService.createManyCards(cards);
        }
      }),
      deleteAllColumns: tool({
        description: 'Delete all columns',
        parameters: z.object({}),
        execute: async () => await this.columnService.deleteAllColumns()
      })
    };
  }

  async handleMessage(message: string) {
    try {
      const { text, toolCalls, toolResults } =
        await this.proccessMessage(message);

      this.messages.push({ role: 'user', content: message });
      if (toolCalls.length > 0) {
        this.messages.push({ role: 'tool', content: toolResults });
      } else {
        this.messages.push({ role: 'assistant', content: text });
      }

      return { toolCalls, message: text, timestamp };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async proccessMessage(message: string) {
    try {
      const response = await generateText({
        model: this.model,
        messages: [...this.messages, { role: 'user', content: message }],
        tools: this.tools,
        maxSteps: 5,
        toolChoice: 'auto',
        onStepFinish({ stepType, toolCalls, toolResults, text }) {
          if (toolCalls.length > 0) {
            console.log('stepType:', stepType);
            console.log('toolCalls:', toolCalls);
            console.log('toolResults:', toolResults);
            console.log('response:', text);
            console.log('------------------------------');
          }
        }
      });

      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  private handleError(error: unknown) {
    if (ToolExecutionError.isInstance(error)) {
      const { message, name, toolArgs, toolName, cause } = error;
      console.log({ name, message, toolArgs, toolName, cause });

      return {
        message:
          'Desculpe, não consegui processar sua solicitação, tente novamente mais tarde!'
      };
    }
    console.error(error);
    return 'Desculpe, não consegui entender sua solicitação. Por favor, tente novamente.';
  }
}
