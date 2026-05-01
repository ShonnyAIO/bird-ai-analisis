# Usar la imagen oficial de Bun como base
FROM oven/bun:1-slim AS base
WORKDIR /app

# Instalar dependencias en una capa separada
FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Imagen final para ejecución
FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY . .

# Usar un usuario no root por seguridad
USER bun

# Exponer el puerto
EXPOSE 3001
ENV PORT=3001

# Salud del contenedor
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:' + (process.env.PORT || 3001) + '/status').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Comando para iniciar la aplicación
CMD ["bun", "run", "start"]
