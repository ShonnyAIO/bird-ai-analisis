# 🚀 Guía de Despliegue en Vercel (Edge Runtime)

Este proyecto está optimizado para ejecutarse en **Vercel** utilizando el **Edge Runtime**, lo que garantiza una latencia mínima y un rendimiento excepcional.

## 1. Configuración de Vercel

La aplicación utiliza un archivo `vercel.json` que redirige las peticiones de la API al servidor y sirve los archivos estáticos desde la carpeta `public/`.

### Requisitos previos
- Una cuenta en [Vercel](https://vercel.com).
- Vercel CLI instalado: `npm i -g vercel`.

### Pasos para el despliegue mediante CLI
1. Abre una terminal en la raíz del proyecto.
2. Ejecuta `vercel` para vincular y configurar el proyecto.
3. Responde **No** cuando pregunte si quieres usar los ajustes por defecto de Vercel (para asegurar que use nuestra configuración de `vercel.json`).
4. Añade tu clave de HuggingFace:
   ```bash
   vercel env add HUGGINGFACE_API_KEY
   ```
5. Despliega a producción:
   ```bash
   vercel --prod
   ```

## 2. Variables de Entorno (Environment Variables)

Para el funcionamiento actual (HuggingFace Edition), solo necesitas:

- `HUGGINGFACE_API_KEY`: Tu token de Hugging Face (puedes obtenerlo en [hf.co/settings/tokens](https://huggingface.co/settings/tokens)).

*Opcional*: Si decides habilitar otros proveedores en `src/index.ts`, deberás añadir sus respectivas claves (`OPENAI_API_KEY`, `GEMINI_API_KEY`, etc.).

## 3. Ventajas del Edge Runtime
- **Streaming Instantáneo**: Las respuestas de IA se envían al navegador sin esperar a que se genere todo el texto.
- **Sin Arranque en Frío (Cold Starts)**: A diferencia de las funciones Serverless tradicionales, las funciones en el Edge están siempre "calientes".
- **Global**: Tu proxy se ejecutará en la región más cercana al usuario que hace la petición.

## 4. Uso de la API y Swagger

Una vez desplegado, puedes acceder a la interfaz de Swagger para probar la API en:
`https://tu-proyecto.vercel.app/swagger`

---

## 5. Despliegue con Docker

Si prefieres desplegar en un servidor propio (VPS), DigitalOcean, AWS, etc., puedes usar Docker.

### Requisitos
- Docker y Docker Compose instalados.
- Archivo `.env` con las credenciales necesarias.

### Pasos para el despliegue
1. Clona el repositorio en tu servidor.
2. Crea el archivo `.env` basado en `.env.example`.
3. Ejecuta:
   ```bash
   docker compose up -d --build
   ```

La aplicación estará escuchando en el puerto `3001` (o el que definas en la variable `PORT`).

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
