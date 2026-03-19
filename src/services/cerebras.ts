import Cerebras from '@cerebras/cerebras_cloud_sdk';
import type { AIService, ChatMessage } from '../types';

const cerebras = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY
});

export const cerebrasService: AIService = {
    name: 'Cerebras',
    async *chat(messages: ChatMessage[]) {
        try {
            // Detectar URLs de imágenes y formatear mensajes para multimodal
            const formattedMessages = messages.map(m => {
                const imageUrls = m.content.match(/https?:\/\/\S+\.(?:png|jpg|jpeg|webp|gif)/gi);

                if (imageUrls && imageUrls.length > 0) {
                    const contentParts: any[] = [{ type: 'text', text: m.content }];
                    imageUrls.forEach(url => {
                        contentParts.push({
                            type: 'image_url',
                            image_url: { url }
                        });
                    });
                    return { role: m.role, content: contentParts };
                }
                return m;
            });

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
