import OpenAI from 'openai';
import type { AIService, ChatMessage } from '../types';
import { prepareVisionMessages } from '../utils';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'https://github.com/shonny-torres/multiprovider-proxy-ai',
        'X-Title': 'Multi-Provider AI Proxy'
    }
});

export const openRouterService: AIService = {
    name: 'OpenRouter',
    async *chat(messages: ChatMessage[]) {
        try {
            const formattedMessages = await prepareVisionMessages(messages);
            const stream = await openai.chat.completions.create({
                model: 'qwen/qwen-2.5-vl-72b-instruct',
                messages: formattedMessages as any[],
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) yield content;
            }
        } catch (error) {
            console.error('Error in OpenRouter service:', error);
            yield `[Error OpenRouter]: ${(error as Error).message}`;
        }
    }
};
