import OpenAI from 'openai';
import type { AIService, ChatMessage } from '../types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const chatGptService: AIService = {
    name: 'ChatGPT',
    async *chat(messages: ChatMessage[]) {
        try {
            const stream = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages as any[],
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) yield content;
            }
        } catch (error) {
            console.error('Error in ChatGPT service:', error);
            yield `[Error ChatGPT]: ${(error as Error).message}`;
        }
    }
};
