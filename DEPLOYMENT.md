# 🚀 Guía de Despliegue en Vercel

Este proyecto está optimizado para ejecutarse en **Vercel** de forma sencilla y eficiente, aprovechando la potencia de **Bun**.

## 1. Configuración de Vercel

La aplicación utiliza un archivo `vercel.json` que gestiona las rutas automáticamente:
- Las peticiones de la API se dirigen al bundle generado en `api/index.js`.
- Los archivos estáticos se sirven directamente desde la carpeta `public/`.

### Requisitos previos
- Una cuenta en [Vercel](https://vercel.com).
- Vercel CLI instalado: `npm i -g vercel`.

### Pasos para el despliegue mediante CLI
1. Abre una terminal en la raíz del proyecto.
2. Ejecuta `vercel` para vincular y configurar el proyecto.
3. El **Framework Preset** debería ser detectado como **Other**.
4. Añade tu clave de HuggingFace en el panel de Vercel o vía CLI:
   ```bash
   vercel env add HUGGINGFACE_API_KEY
   ```
5. Despliega a producción:
   ```bash
   vercel --prod
   ```

## 2. Variables de Entorno (Environment Variables)

Para el funcionamiento actual (HuggingFace Edition), es obligatorio configurar:

- `HUGGINGFACE_API_KEY`: Tu token de Hugging Face.

## 3. Funcionamiento de la API

Una vez desplegado, el servidor de Elysia manejará tanto el streaming de texto como las respuestas JSON para clasificación. Puedes probar la API en:
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
