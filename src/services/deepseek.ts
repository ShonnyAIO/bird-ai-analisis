import OpenAI from 'openai';
import type { AIService, ChatMessage } from '../types.js';
import { prepareVisionMessages } from '../utils.js';

const deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
});

export const deepSeekService: AIService = {
    name: 'DeepSeek',
    async *chat(messages: ChatMessage[]) {
        try {
            const formattedMessages = await prepareVisionMessages(messages);
            const stream = await deepseek.chat.completions.create({
                model: 'deepseek-chat',
                messages: formattedMessages as any[],
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) yield content;
            }
        } catch (error) {
            console.error('Error in DeepSeek service:', error);
            yield `[Error DeepSeek]: ${(error as Error).message}`;
        }
    }
};
