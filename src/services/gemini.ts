import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIService, ChatMessage, MessagePart } from '../types.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function parseBase64(dataUrl: string) {
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return null;
    return {
        mimeType: matches[1],
        data: matches[2]
    };
}

export const geminiService: AIService = {
    name: 'Gemini',
    async *chat(messages: ChatMessage[]) {
        try {
            // Extract system message if present
            const systemMessage = messages.find(m => m.role === 'system');
            const systemContent = typeof systemMessage?.content === 'string' 
                ? systemMessage.content 
                : systemMessage?.content?.map(p => p.text).join(' ');

            // Filter out system messages for the history
            const userMessages = messages.filter(m => m.role !== 'system');

            // Use gemini-2.0-flash which is stable and common
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                systemInstruction: systemContent
            });

            if (userMessages.length === 0) {
                yield "[Error Gemini]: No user messages provided";
                return;
            }

            // Map messages to Gemini history format (user/model)
            const mappedMessages = userMessages.map(m => {
                const parts = [];
                if (typeof m.content === 'string') {
                    parts.push({ text: m.content });
                } else {
                    for (const part of m.content) {
                        if (part.type === 'text' && part.text) {
                            parts.push({ text: part.text });
                        } else if (part.type === 'image_url' && part.image_url) {
                            const b64 = parseBase64(part.image_url.url);
                            if (b64) {
                                parts.push({
                                    inlineData: {
                                        mimeType: b64.mimeType!,
                                        data: b64.data!
                                    }
                                });
                            }
                        }
                    }
                }
                return {
                    role: m.role === 'user' ? 'user' : 'model',
                    parts
                };
            });

            // Last message for sendMessageStream
            const lastMessageObj = mappedMessages.pop();
            const lastMessageParts = lastMessageObj?.parts || [];

            // History for startChat
            let history = mappedMessages;

            // CRITICAL: Gemini history must start with 'user' role
            while (history.length > 0 && history[0]?.role !== 'user') {
                history.shift();
            }

            const chat = model.startChat({ history });
            // sendMessageStream can take an array of parts
            const result = await chat.sendMessageStream(lastMessageParts);

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (chunkText) yield chunkText;
            }
        } catch (error) {
            console.error('Error in Gemini service:', error);
            yield `[Error Gemini]: ${(error as Error).message}`;
        }
    }
};

