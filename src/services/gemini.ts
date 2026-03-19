import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIService, ChatMessage } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiService: AIService = {
    name: 'Gemini',
    async *chat(messages: ChatMessage[]) {
        try {
            // Extract system message if present
            const systemMessage = messages.find(m => m.role === 'system');
            // Filter out system messages for the history
            const userMessages = messages.filter(m => m.role !== 'system');

            // Use gemini-1.5-flash which is stable and common
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                systemInstruction: systemMessage?.content
            });

            if (userMessages.length === 0) {
                yield "[Error Gemini]: No user messages provided";
                return;
            }

            // Map messages to Gemini history format (user/model)
            const mappedMessages = userMessages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }));

            // Last message for sendMessageStream
            const lastMessageObj = mappedMessages.pop();
            const lastMessage = lastMessageObj?.parts?.[0]?.text || '';

            // History for startChat
            let history = mappedMessages;

            // CRITICAL: Gemini history must start with 'user' role
            while (history.length > 0 && history[0]?.role !== 'user') {
                history.shift();
            }

            const chat = model.startChat({ history });
            const result = await chat.sendMessageStream(lastMessage);

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

