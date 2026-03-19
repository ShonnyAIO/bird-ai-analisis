import { HfInference } from '@huggingface/inference';
import type { AIService, ChatMessage } from '../types';
import { prepareVisionMessages } from '../utils';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const huggingFaceService: AIService = {
    name: 'HuggingFace',
    async *chat(messages: ChatMessage[]) {
        try {
            // Procesar imágenes (URLs -> Base64)
            const formattedMessages = await prepareVisionMessages(messages);

            const stream = hf.chatCompletionStream({
                model: 'Qwen/Qwen2.5-VL-72B-Instruct',
                messages: formattedMessages as any[],
                max_tokens: 1024
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) yield content;
            }
        } catch (error) {
            console.error('Error in HuggingFace service:', error);
            yield `[Error HuggingFace]: ${(error as Error).message}`;
        }
    }
};
