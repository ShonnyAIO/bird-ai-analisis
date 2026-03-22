import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
// import { chatGptService } from './services/chatgpt.js';
// import { deepSeekService } from './services/deepseek.js';
import { geminiService } from './services/gemini.js';
import { huggingFaceService } from './services/huggingface.js';
// import { groqService } from './services/groq.js';
// import { cerebrasService } from './services/cerebras.js';
// import { openRouterService } from './services/openrouter.js';
// import { togetherService } from './services/together.js';
import type { AIService } from './types.js';

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
        return new Response(new ReadableStream({
            async start(controller) {
                let attempts = 0;
                const maxAttempts = services.length;
                let success = false;
                let lastErrorText = "";

                while (attempts < maxAttempts && !success) {
                    const service = getNextService();
                    console.log(`[Proxy] Enrutando petición (Streaming) a proveedor: ${service.name} (Intento ${attempts + 1}/${maxAttempts})`);
                    console.log(`[Request] Messages:`, JSON.stringify(body.messages, null, 2));

                    let fullResponse = "";
                    let startedStreaming = false;

                    try {
                        for await (const chunk of service.chat(body.messages)) {
                            startedStreaming = true;
                            fullResponse += chunk;
                            controller.enqueue(new TextEncoder().encode(chunk));
                        }
                        console.log(`[Response] Final (${service.name}):`, fullResponse);
                        success = true;
                    } catch (error) {
                        console.error(`[Proxy] Stream error con proveedor ${service.name}:`, error instanceof Error ? error.message : String(error));
                        lastErrorText = error instanceof Error ? error.message : String(error);
                        attempts++;

                        if (startedStreaming) {
                            console.log(`[Proxy] El proveedor ${service.name} falló después de enviar datos. No se puede reintentar de forma segura.`);
                            break;
                        }

                        console.log(`[Proxy] Reintentando con el siguiente proveedor...`);
                    }
                }

                if (!success) {
                    console.error(`[Proxy] Todos los proveedores fallaron. Último error: ${lastErrorText}`);
                    controller.enqueue(new TextEncoder().encode(`\n[Error de Proxy: Todos los proveedores fallaron. Error: ${lastErrorText}]`));
                }

                controller.close();
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
        let attempts = 0;
        const maxAttempts = services.length;
        let lastErrorText = "";

        while (attempts < maxAttempts) {
            const service = getNextService();
            console.log(`[Proxy] Enrutando petición (JSON) a proveedor: ${service.name} (Intento ${attempts + 1}/${maxAttempts})`);
            console.log(`[Request] Messages:`, JSON.stringify(body.messages, null, 2));

            let fullResponse = "";
            let streamSuccess = false;

            try {
                for await (const chunk of service.chat(body.messages)) {
                    fullResponse += chunk;
                }
                streamSuccess = true;
            } catch (error) {
                console.error(`[Proxy] Error con proveedor ${service.name}:`, error instanceof Error ? error.message : String(error));
                lastErrorText = error instanceof Error ? error.message : String(error);
                attempts++;
                console.log(`[Proxy] Reintentando con el siguiente proveedor...`);
            }

            if (streamSuccess) {
                console.log(`[Response] Full (${service.name}):`, fullResponse);

                try {
                    // Intentamos limpiar posibles backticks de markdown que la IA a veces incluye
                    const cleanJson = fullResponse.replace(/```json|```/g, '').trim();
                    return JSON.parse(cleanJson);
                } catch (error) {
                    console.error(`[Proxy] Error parseando JSON de ${service.name}:`, error instanceof Error ? error.message : String(error));
                    lastErrorText = error instanceof Error ? error.message : String(error);
                    attempts++;
                    console.log(`[Proxy] Respuesta JSON inválida. Reintentando con el siguiente proveedor...`);
                }
            }
        }

        return {
            status: "ERROR",
            message: "All AI providers failed or returned invalid JSON",
            last_error: lastErrorText
        };
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
    });

if (!process.env.VERCEL) {
    app.listen(process.env.PORT || 3000);
}

if (app.server) {
    console.log(`🚀 AI Proxy ejecutándose en ${app.server.hostname}:${app.server.port}`);
    console.log(`📑 Documentación Swagger disponible en http://localhost:${app.server.port}/swagger`);
}

export default app;
