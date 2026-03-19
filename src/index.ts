import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
// import { chatGptService } from './services/chatgpt';
// import { deepSeekService } from './services/deepseek';
import { geminiService } from './services/gemini';
import { huggingFaceService } from './services/huggingface';
// import { groqService } from './services/groq';
// import { cerebrasService } from './services/cerebras';
// import { openRouterService } from './services/openrouter';
// import { togetherService } from './services/together';
import type { AIService } from './types';

// Proveedores registrados en el proxy
const services: AIService[] = [
    geminiService,
    huggingFaceService
    // togetherService,
    // cerebrasService,
    // groqService,
    // openRouterService,
];

let currentServiceIndex = 0;

function getNextService(): AIService {
    const service = services[currentServiceIndex] ?? services[0];
    currentServiceIndex = (currentServiceIndex + 1) % services.length;
    return service!;
}

const app = new Elysia()
    .use(cors({
        origin: ['*'], // Puedes cambiar esto por los dominios permitidos
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }))
    .use(swagger({
        documentation: {
            info: {
                title: 'Multi-Provider AI Proxy API',
                version: '1.0.0',
                description: 'Proxy para balanceo de carga entre múltiples proveedores de IA (ChatGPT, Gemini, DeepSeek, HuggingFace, Groq, Cerebras)'
            },
            tags: [
                { name: 'AI', description: 'Endpoints relacionados con IA' }
            ]
        }
    }))
    .get('/', () => ({ status: 'ok', message: 'AI Proxy is running' }))
    .post('/chat', async ({ body }) => {
        const service = getNextService();
        console.log(`[Proxy] Enrutando petición (Streaming) a proveedor: ${service.name}`);
        console.log(`[Request] Messages:`, JSON.stringify(body.messages, null, 2));

        return new Response(new ReadableStream({
            async start(controller) {
                let fullResponse = "";
                try {
                    for await (const chunk of service.chat(body.messages)) {
                        fullResponse += chunk;
                        controller.enqueue(new TextEncoder().encode(chunk));
                    }
                } catch (error) {
                    console.error("[Proxy] Stream error:", error);
                } finally {
                    console.log(`[Response] Final (${service.name}):`, fullResponse);
                    controller.close();
                }
            }
        }), {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });
    }, {
        body: t.Object({
            messages: t.Array(t.Object({
                role: t.Union([t.Literal('user'), t.Literal('assistant'), t.Literal('system')]),
                content: t.String()
            }))
        }),
        detail: {
            tags: ['AI'],
            summary: 'Chat con balanceo de proveedores (Streaming)',
            description: 'Envía una lista de mensajes y recibe una respuesta en streaming (SSE).'
        }
    })
    .post('/classify', async ({ body }) => {
        const service = getNextService();
        console.log(`[Proxy] Enrutando petición (JSON) a proveedor: ${service.name}`);
        console.log(`[Request] Messages:`, JSON.stringify(body.messages, null, 2));

        let fullResponse = "";
        for await (const chunk of service.chat(body.messages)) {
            fullResponse += chunk;
        }

        console.log(`[Response] Full (${service.name}):`, fullResponse);

        try {
            // Intentamos limpiar posibles backticks de markdown que la IA a veces incluye
            const cleanJson = fullResponse.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (error) {
            return {
                status: "ERROR",
                message: "Failed to parse AI response as JSON",
                raw: fullResponse
            };
        }
    }, {
        body: t.Object({
            messages: t.Array(t.Object({
                role: t.Union([t.Literal('user'), t.Literal('assistant'), t.Literal('system')]),
                content: t.String()
            }))
        }),
        detail: {
            tags: ['AI'],
            summary: 'Clasificación de contenido artitístico (JSON)',
            description: 'Envía los prompts de curaduría y recibe directamente el objeto JSON de clasificación.'
        }
    })

if (!process.env.VERCEL) {
    app.listen(process.env.PORT || 3000);
}

if (app.server) {
    console.log(`🚀 AI Proxy ejecutándose en ${app.server.hostname}:${app.server.port}`);
    console.log(`📑 Documentación Swagger disponible en http://localhost:${app.server.port}/swagger`);
}

export default app;
