# 🤖 Multi-Provider AI Proxy

Version 1.0.1

Este repositorio contiene la arquitectura y las instrucciones para un servidor Proxy que balancea peticiones entre múltiples proveedores de IA (LLMs). Unifica respuestas bajo un solo endpoint, maximiza el uso de capas gratuitas y evita bloqueos por límite de peticiones.

**Implementado con Bun, Elysia, TypeScript y Swagger.**

---

## 🏗️ Arquitectura del Sistema

El sistema actúa como un intermediario (Proxy) que decide a qué proveedor de IA llamar mediante un algoritmo de balanceo **Round-Robin**.

### Características clave:
1. **Contrato Único (Interfaz)**: Todos los proveedores cumplen con la misma interfaz.
2. **Respuestas en Streaming (SSE)**: El servidor devuelve fragmentos de texto en tiempo real.
3. **Swagger UI**: Documentación interactiva integrada.
4. **CORS Configurable**: Listo para ser consumido desde cualquier dominio.

---

## 🚀 Instalación y Desarrollo

1. **Instalar dependencias**:
   ```bash
   bun install
   ```

2. **Configurar Variables de Entorno**:
   Crea un archivo `.env` o configura en tu entorno:
   ```env
   OPENAI_API_KEY="sk-..."
   DEEPSEEK_API_KEY="sk-..."
   GEMINI_API_KEY="AIza..."
   HUGGINGFACE_API_KEY="hf_..."
   GROQ_API_KEY="gsk_..."
   CEREBRAS_API_KEY="csk_..."
   ```

3. **Ejecutar en modo desarrollo**:
   ```bash
   bun dev
   ```

4. **Acceder a la documentación**:
   Abre [http://localhost:3000/swagger](http://localhost:3000/swagger) para ver y probar los endpoints.

---

## 🛠️ Estructura del Proyecto

- `src/index.ts`: Servidor principal y configuración de rutas (Elysia).
- `src/types.ts`: Definición de interfaces comunes.
- `src/services/`: Implementaciones de cada proveedor de IA.
  - `chatgpt.ts`
  - `deepseek.ts`
  - `gemini.ts`
  - `huggingface.ts`
  - `groq.ts`
  - `cerebras.ts`

---

## 📦 Despliegue en Vercel

Consulta la guía detallada en [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 📝 Ejemplo de Uso

### Endpoint POST `/chat`

**Cuerpo (JSON):**
```json
{
  "messages": [
    { "role": "user", "content": "Hola, ¿cómo estás?" }
  ]
}
```

**Respuesta:** Streaming de texto (Server-Sent Events).
