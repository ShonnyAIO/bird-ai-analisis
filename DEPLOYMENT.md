# 🚀 Guía de Despliegue en Vercel

Este proyecto está optimizado para ejecutarse en **Bun**, lo cual es ideal para un rendimiento extremo. Para desplegarlo en Vercel, sigue estas instrucciones.

## 1. Configuración de Vercel

Vercel soporta Bun nativamente. Solo necesitas configurar el proyecto correctamente.

### Opción A: Usando la CLI de Vercel (Recomendado)
1. Instala la CLI de Vercel: `npm i -g vercel`
2. Ejecuta `vercel` en la raíz del proyecto.
3. Sigue los pasos y asegúrate de añadir las variables de entorno necesarias.

### Opción B: Panel de Vercel (GitHub/GitLab)
1. Sube tu código a un repositorio.
2. Importa el proyecto en Vercel.
3. El **Framework Preset** debería detectarse como `Other` o puedes seleccionar `Bun`.
4. El comando de instalación debe ser `bun install`.
5. El comando de construcción puede ser `bun build src/index.ts --outdir ./dist` (aunque Vercel puede ejecutar Bun directamente en algunos casos).

## 2. Variables de Entorno (Enviroment Variables)

Debes configurar las siguientes claves en el panel de Vercel (Settings > Environment Variables):

- `OPENAI_API_KEY`: Tu clave de OpenAI.
- `DEEPSEEK_API_KEY`: Tu clave de DeepSeek.
- `GEMINI_API_KEY`: Tu clave de Google AI Studio.
- `HUGGINGFACE_API_KEY`: Tu clave de Hugging Face.
- `GROQ_API_KEY`: Tu clave de Groq.
- `CEREBRAS_API_KEY`: Tu clave de Cerebras.
- `PORT`: 3000 (Opcional, Vercel maneja esto automáticamente).

## 3. Configuración de CORS

El servidor ya tiene configurado CORS para permitir todos los dominios (`*`).
Si deseas restringirlo a ciertos dominios, edita `src/index.ts`:

```typescript
.use(cors({
    origin: ['https://tu-dominio.com', 'https://otro-dominio.com'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
```

## 4. Uso de la API (Swagger)

Una vez desplegado, puedes acceder a la interfaz de Swagger en:
`https://tu-proyecto.vercel.app/swagger`

Desde allí puedes probar el endpoint `/chat` directamente.

---

### Ejemplo de petición con `curl`:

```bash
curl -X POST https://tu-proyecto.vercel.app/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Hola, ¿quién eres?" }
    ]
  }'
```

La respuesta será un streaming de texto (SSE).
