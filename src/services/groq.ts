import Groq from 'groq-sdk';
import type { AIService, ChatMessage } from '../types.js';
import { prepareVisionMessages } from '../utils.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const groqService: AIService = {
    name: 'Groq',
    async *chat(messages: ChatMessage[]) {
        try {
            // Detectar URLs de imágenes y formatear mensajes para multimodal
            const formattedMessages = await prepareVisionMessages(messages);

            const stream = await groq.chat.completions.create({
                messages: formattedMessages as any[],
                model: 'llama-3.2-11b-vision-preview',
                temperature: 0.2,
                max_completion_tokens: 1024,
                top_p: 1,
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) yield content;
            }
        } catch (error) {
            console.error('Error in Groq service:', error);
            yield `[Error Groq]: ${(error as Error).message}`;
        }
    }
};
