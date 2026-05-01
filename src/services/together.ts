import OpenAI from 'openai';
import type { AIService, ChatMessage } from '../types.js';
import { prepareVisionMessages } from '../utils.js';

const together = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: 'https://api.together.xyz/v1'
});

export const togetherService: AIService = {
    name: 'Together AI',
    async *chat(messages: ChatMessage[]) {
        try {
            const formattedMessages = await prepareVisionMessages(messages);
            const stream = await together.chat.completions.create({
                model: 'meta-llama/Llama-4-Scout',
                messages: formattedMessages as any[],
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) yield content;
            }
        } catch (error) {
            console.error('Error in Together service:', error);
            yield `[Error Together]: ${(error as Error).message}`;
        }
    }
};
