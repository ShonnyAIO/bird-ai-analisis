export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AIService {
  name: string;
  // Devuelve un generador asíncrono para emitir los fragmentos del texto en tiempo real
  chat: (messages: ChatMessage[]) => AsyncGenerator<string, void, unknown>;
}
