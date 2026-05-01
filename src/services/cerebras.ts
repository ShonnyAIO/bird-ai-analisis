import Cerebras from '@cerebras/cerebras_cloud_sdk';
import type { AIService, ChatMessage } from '../types.js';
import { prepareVisionMessages } from '../utils.js';

const cerebras = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY
});

export const cerebrasService: AIService = {
    name: 'Cerebras',
    async *chat(messages: ChatMessage[]) {
        try {
            // Detectar URLs de imágenes y formatear mensajes para multimodal
            const formattedMessages = await prepareVisionMessages(messages);

            const stream = await cerebras.chat.completions.create({
                messages: formattedMessages as any[],
                model: 'llama-3.2-11b-vision-instruct',
                max_completion_tokens: 1024,
                temperature: 0.2,
                top_p: 1,
                stream: true,
            });

            for await (const chunk of stream) {
                const content = (chunk as any).choices[0]?.delta?.content || '';
                if (content) yield content;
            }
        } catch (error) {
            console.error('Error in Cerebras service:', error);
            yield `[Error Cerebras]: ${(error as Error).message}`;
        }
    }
};
