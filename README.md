# 🤖 Multi-Provider AI Proxy (HuggingFace Edition)

Version 1.0.4

Este repositorio contiene la arquitectura de un servidor Proxy para LLMs. Actualmente está configurado para utilizar **HuggingFace** de forma exclusiva, aunque mantiene la arquitectura necesaria para balancear peticiones entre múltiples proveedores si se desea.

**Implementado con Bun, Elysia, TypeScript y Swagger.**

---

## 🏗️ Arquitectura del Sistema

El sistema actúa como un intermediario (Proxy) que unifica la interfaz de diferentes proveedores de IA.

### Características clave:
1. **Configuración Actual**: Optimizado para usar **HuggingFace** por defecto.
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
   Crea un archivo `.env` o configura en tu entorno basado en `.env.example`.

3. **Ejecutar en modo desarrollo**:
   ```bash
   bun dev
   ```

4. **Acceder a la documentación**:
   Abre [http://localhost:3001/swagger](http://localhost:3001/swagger) para ver y probar los endpoints.

---

## 🐳 Docker

### Ejecución en Producción
```bash
docker compose up -d --build
```

### Desarrollo con Hot-Reloading
```bash
docker compose -f docker-compose.dev.yml up
```

La aplicación estará disponible en `http://localhost:3001`.

## 🛠️ Comandos Útiles (Makefile)

Si tienes `make` instalado, puedes usar estos atajos:
- `make install`: Instala dependencias.
- `make dev`: Inicia el servidor en modo desarrollo local.
- `make test`: Ejecuta las pruebas unitarias.
- `make docker-up`: Levanta el contenedor de producción.
- `make docker-dev`: Levanta el entorno de desarrollo en Docker con hot-reload.

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
