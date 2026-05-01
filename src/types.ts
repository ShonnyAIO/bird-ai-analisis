export type ChatRole = 'user' | 'assistant' | 'system';

export interface MessagePart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string; // This can be a base64 string or a URL
  };
}

export interface ChatMessage {
  role: ChatRole;
  content: string | MessagePart[];
}

export interface AIService {
  name: string;
  // Devuelve un generador asíncrono para emitir los fragmentos del texto en tiempo real
  chat: (messages: ChatMessage[]) => AsyncGenerator<string, void, unknown>;
}
